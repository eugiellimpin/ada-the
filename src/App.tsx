import ky from "ky";
import React, { useEffect, useState } from "react";

import "./App.css";

interface NodeContent {
  type: "text";
  body: string;
}

interface Node {
  id: number;
  title: string;
  connections?: number[];
  content?: NodeContent[];
}

interface NodesById {
  [id: string]: Node;
}

const getNodes = (nodesById: NodesById, ids: number[]) => {
  return ids.map(id => nodesById[id]);
};

interface NodeItemProps {
  node: Node;
  onClick: (id: number) => void;
  depth?: number;
  getConnections: (ids: number[]) => Node[];
}

const NodeItem = ({
  node,
  onClick,
  depth = 0,
  getConnections,
}: NodeItemProps) => {
  const { id, title, connections } = node;

  return (
    <div key={id} className={`node depth-${depth}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick(id);
        }}
      >
        {id} {title}
      </button>
      {depth < 2 &&
        getConnections(connections || []).map((n) => {
          return (
            <NodeItem
              node={n}
              onClick={onClick}
              depth={depth + 1}
              getConnections={getConnections}
              key={n.id}
            />
          );
        })}
    </div>
  );
};

function App() {
  const [nodesById, setNodesById] = useState<NodesById>({});

  const fetchNode = async (id: number) => {
    // This endpoint returns an array that contains only one node
    const [fetchedNode] = await ky.get(`/nodes/${id}`).json();
    console.assert(fetchNode.length === 1);

    setNodesById((prev) => ({
      ...prev,
      [fetchedNode.id]: fetchedNode,
    }));
  };

  useEffect(() => {
    const fetchNodes = async () => {
      const fetchedNodes: Node[] = await ky.get("/nodes").json();
      const nodesById = fetchedNodes.reduce((db, node) => {
        db[node.id] = node;
        return db;
      }, {} as NodesById);

      setNodesById(nodesById);
    };

    fetchNodes();
  }, []);

  return (
    <div className="">
      <div className="sidebar">
        {Object.values(nodesById).map((node) => (
          <NodeItem
            node={node}
            onClick={fetchNode}
            getConnections={(ids: number[]) => getNodes(nodesById, ids)}
            key={node.id}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
