# KFC New Feature Demo

This demo showcases the new KFC feature by creating a namespace, deploying an nginx pod, adding a finalizer, and demonstrating the proxy functionality.

Sub Resources:

- `K8s().Scale()` - Scale a scalable resource like a Deployment.
- `K8s().Proxy()` - Proxy to a specific port of a pod.
- `K8s().Finalize()` - Manage finalizers for Kubernetes resources.
- `K8s().Logs()` - Fetch logs from all pods by default.
- `K8s().PatchStatus()` - Patch the status subresource of a Kubernetes object.
- `K8s().Evict()` - Evict a pod from a node.

Run the demo by executing the following command:

```bash
npm run demo
```
