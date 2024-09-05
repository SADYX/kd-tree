import { KdTree } from '../src/KdTree';

interface TestType {
  x: number;
  y: number
}

describe('kd-tree class', () => {
  const points: TestType[] = [
    { x: 0, y: 1 },
    { x: 10, y: 21 },
    { x: 5, y: 2 },
    { x: 62, y: 2 },
    { x: 3, y: 51 },
    { x: 11, y: 1 },
    { x: 5, y: 17 },
    { x: 5500, y: 2000 },
    { x: 5500, y: 2001 },
  ];

  const distanceFn = (a: TestType, b: TestType) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  const tree = new KdTree(
    points,
    distanceFn,
    ['x', 'y'],
    { maxVariance: true }
  );

  test('init tree', () => {
    console.dir(tree.root?.toJSON(), { depth: null });

    expect(tree).toBeInstanceOf(KdTree);
  });

  test('insert', () => {
    tree.insert({ x: 20, y: 20 });
    // console.dir(tree.root?.toJSON(), { depth: null });

    expect(tree.points.length).toBe(points.length + 1);
  });

  test('remove', () => {
    tree.remove({ x: 62, y: 2 });
    console.dir(tree.root?.toJSON(), { depth: null });

    expect(tree.points.length).toBe(points.length);
  });

  test('rebuild', () => {
    tree.rebuild({ maxVariance: true });
    console.dir(tree.root?.toJSON(), { depth: null });

    expect(tree.points.length).toBe(points.length);
  });

  test('getNearestByCount', () => {
    const item = tree.getNearestByCount({ x: 20, y: 20 }, 99);
    console.dir(item);

    expect(item[0]).toStrictEqual({ data: { x: 20, y: 20 }, distance: 0 });
  });

  test('getNearestByDistance', () => {
    const item = tree.getNearestByDistance({ x: 20, y: 20 }, 25);
    console.dir(item);

    expect(item[0]).toStrictEqual({ data: { x: 20, y: 20 }, distance: 0 });
  });
})