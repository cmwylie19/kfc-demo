import {
  K8s,
  GenericClass,
  KubernetesObject,
} from "kubernetes-fluent-client";

export async function waitForRunningStatusPhase(
  k: GenericClass,
  o: KubernetesObject,
): Promise<void> {
  const object = await K8s(k)
    .InNamespace(o.metadata?.namespace || "")
    .Get(o.metadata?.name || "");

  if (object.status?.phase !== "Running") {
    await sleep(2);
    return waitForRunningStatusPhase(k, o);
  }
}

export function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
