function isValidEdge(edge) {
  if (typeof edge !== 'string') return false;
  const trimmed = edge.trim();
  const regex = /^([A-Z])->([A-Z])$/;
  const match = trimmed.match(regex);
  if (!match) return false;
  if (match[1] === match[2]) return false;
  return true;
}

function deduplicateEdges(edges) {
  const seen = new Set();
  const validEdges = [];
  const duplicateSet = new Set();
  for (const edge of edges) {
    if (!seen.has(edge)) {
      seen.add(edge);
      validEdges.push(edge);
    } else {
      duplicateSet.add(edge);
    }
  }
  return {
    validEdges,
    duplicateEdges: Array.from(duplicateSet),
  };
}

function buildGraph(validEdges) {
  const children = new Map();
  const parent = new Map();
  const allNodes = new Set();
  for (const edge of validEdges) {
    const [from, to] = edge.split('->');
    allNodes.add(from);
    allNodes.add(to);
    if (parent.has(to)) continue;
    parent.set(to, from);
    if (!children.has(from)) children.set(from, []);
    children.get(from).push(to);
  }
  return { children, parent, allNodes };
}

function getComponentNodes(startNode, children) {
  const visited = new Set();
  const stack = [startNode];
  while (stack.length) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    for (const child of (children.get(node) || [])) {
      stack.push(child);
    }
  }
  return visited;
}

function hasCycleFromNode(startNode, children) {
  const visited = new Set();
  const recursionStack = new Set();
  function dfs(node) {
    visited.add(node);
    recursionStack.add(node);
    const neighbors = children.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }
    recursionStack.delete(node);
    return false;
  }
  return dfs(startNode);
}

function buildTree(node, children, visited = new Set()) {
  if (visited.has(node)) return {};
  visited.add(node);
  const subtree = {};
  const nodeChildren = children.get(node) || [];
  for (const child of nodeChildren) {
    subtree[child] = buildTree(child, children, new Set(visited));
  }
  return subtree;
}

function calculateDepth(node, children, visited = new Set()) {
  if (visited.has(node)) return 0;
  visited.add(node);
  const nodeChildren = children.get(node) || [];
  if (nodeChildren.length === 0) return 1;
  let maxChildDepth = 0;
  for (const child of nodeChildren) {
    const d = calculateDepth(child, children, new Set(visited));
    if (d > maxChildDepth) maxChildDepth = d;
  }
  return 1 + maxChildDepth;
}

function countNodes(node, children, visited = new Set()) {
  if (visited.has(node)) return 0;
  visited.add(node);
  let count = 1;
  for (const child of children.get(node) || []) {
    count += countNodes(child, children, visited);
  }
  return count;
}

function processHierarchy(data) {
  if (!Array.isArray(data)) {
    throw new Error('Input must be an array');
  }

  const invalidEntries = [];
  const potentiallyValidRaw = [];

  for (const item of data) {
    if (isValidEdge(item)) {
      potentiallyValidRaw.push(item.trim());
    } else {
      invalidEntries.push(item);
    }
  }

  const { validEdges, duplicateEdges } = deduplicateEdges(potentiallyValidRaw);
  const { children, parent, allNodes } = buildGraph(validEdges);

  const assignedNodes = new Set();
  const rootsToProcess = [];

  const trueRoots = Array.from(allNodes).filter(n => !parent.has(n)).sort();
  for (const root of trueRoots) {
    const component = getComponentNodes(root, children);
    for (const node of component) assignedNodes.add(node);
    rootsToProcess.push(root);
  }

  for (const node of Array.from(allNodes).sort()) {
    if (!assignedNodes.has(node)) {
      const component = getComponentNodes(node, children);
      for (const n of component) assignedNodes.add(n);
      const fallbackRoot = Array.from(component).sort()[0];
      rootsToProcess.push(fallbackRoot);
    }
  }

  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = null;
  let largestTreeSize = -1;

  for (const root of rootsToProcess) {
    const cycleDetected = hasCycleFromNode(root, children);
    if (cycleDetected) {
      totalCycles++;
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      totalTrees++;
      const tree = {};
      tree[root] = buildTree(root, children);
      const depth = calculateDepth(root, children);
      const size = countNodes(root, children);
      hierarchies.push({ root, tree: tree[root], depth });
      if (
        size > largestTreeSize ||
        (size === largestTreeSize && (largestTreeRoot === null || root < largestTreeRoot))
      ) {
        largestTreeSize = size;
        largestTreeRoot = root;
      }
    }
  }

  if (allNodes.size === 0) {
    largestTreeRoot = null;
  }

  const summary = {
    total_trees: totalTrees,
    total_cycles: totalCycles,
    largest_tree_root: largestTreeRoot,
  };

  return {
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    hierarchies,
    summary,
  };
}

module.exports = { processHierarchy };
