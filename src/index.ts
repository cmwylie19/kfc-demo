import {
  kind,
  K8s,
} from "kubernetes-fluent-client";
import { waitForRunningStatusPhase } from "./helpers";

const namespace = "kfc-features";
const name = "kfc-features-pod";

const start = async () => {
  // Create a namespace
  console.log(`K8s().Apply() - Creating namespace: ${namespace}.\n`);
  await K8s(kind.Namespace).Apply({ metadata: { name: namespace } });

  // Create an nginx pod in the created namespace
  console.log(
    `K8s().Apply() - Creating pod: ${name} in namespace: ${namespace} with image nginx:latest.\n`,
  );
  await K8s(kind.Pod).Apply(
    {
      metadata: { name, namespace },
      spec: { containers: [{ name: "nginx", image: "nginx:latest" }] },
    },
    { force: true },
  );

  // Add a finalizer to the Pod after it is created
  console.log(
    `K8s().Finalize() - Adding finalizer 'defenseunicorns.com/finalizer' to pod: ${name}.\n`,
  );
  await K8s(kind.Pod)
    .InNamespace(namespace)
    .Finalize("add", "defenseunicorns.com/finalizer", name);
  const pod = await K8s(kind.Pod).InNamespace(namespace).Get(name);

  console.log(`Pod finalizers : ${pod.metadata?.finalizers}.\n`);
  await waitForRunningStatusPhase(kind.Pod, {
    metadata: { name, namespace },
  });

  // Hit port 80 of the nginx pod
  console.log(`K8s().Proxy() - Proxying to port 80 of the pod: ${name}.\n`);
  const nginxHome = await K8s(kind.Pod)
    .InNamespace(namespace)
    .Proxy(name, "80");
  console.log(`Port 80 proxy results:\n ${nginxHome}.\n`);

  // Create a Deployment with a single replica in the created namespace
  console.log(
    `K8s().Apply(): ${name}-deployment in namespace: ${namespace} with image nginx:latest.\n`,
  );
  await K8s(kind.Deployment).Apply({
    metadata: { name: `${name}-deployment`, namespace },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: { app: name },
      },
      template: {
        metadata: { labels: { app: name } },
        spec: {
          containers: [{ name: "nginx", image: "nginx:latest" }],
        },
      },
    },
  });

  // Scale the Deployment to 3 replicas
  console.log(
    `K8s().Scale() - Scaling deployment: ${name}-deployment to 3 replicas in namespace: ${namespace}.\n`,
  );

  await K8s(kind.Deployment)
    .InNamespace(namespace)
    .Scale(3, `${name}-deployment`);

  const deploy = await K8s(kind.Deployment)
    .InNamespace(namespace)
    .Get(`${name}-deployment`);
  console.log(`Deployment now has ${deploy.spec?.replicas} replicas.\n`);

  const logs = await K8s(kind.Pod)
    .InNamespace(namespace)
    .Logs(name);
  console.log(`Pod logs:\n ${logs}.\n`);
};

const end = async () => {
  // Remove the finalizer from the Pod
  console.log(
    `K8s().Finalize() - Removing finalizer 'defenseunicorns.com/finalizer' from pod: ${name}.\n`,
  );
  await K8s(kind.Pod)
    .InNamespace(namespace)
    .Finalize("remove", "defenseunicorns.com/finalizer", name);

  // Delete the namespace
  console.log(`K8s().Delete() - Deleting namespace: ${namespace}.\n`);
  await K8s(kind.Namespace).Delete({ metadata: { name: namespace } });
};

const demo = async () => {
  try {
    await start();
  } catch (error) {
    console.error("Error during demo:", error);
  } finally {
    await end();
  }
};

demo().catch((error) => {
  console.error("Unexpected error:", error);
});

