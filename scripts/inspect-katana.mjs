import { NodeIO } from "@gltf-transform/core";

const io = new NodeIO();
const doc = await io.read("public/models/katana.glb");
const root = doc.getRoot();

function format(arr) {
  return arr.map((value) => value.toFixed(3)).join(", ");
}

for (const scene of root.listScenes()) {
  scene.traverse((node) => {
    const mesh = node.getMesh ? node.getMesh() : null;
    if (!mesh) {
      return;
    }

    mesh.listPrimitives().forEach((primitive, index) => {
      const position = primitive.getAttribute("POSITION");
      if (!position) {
        return;
      }

      const array = position.getArray();
      const min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
      const max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

      for (let i = 0; i < array.length; i += 3) {
        const x = array[i];
        const y = array[i + 1];
        const z = array[i + 2];

        if (x < min[0]) min[0] = x;
        if (y < min[1]) min[1] = y;
        if (z < min[2]) min[2] = z;

        if (x > max[0]) max[0] = x;
        if (y > max[1]) max[1] = y;
        if (z > max[2]) max[2] = z;
      }

      const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
      const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];

      console.log(
        `node=${node.getName() || "(noname)"} mesh=${mesh.getName() || "(noname)"} prim=${index} center=${format(center)} size=${format(size)}`,
      );
    });
  });
}
