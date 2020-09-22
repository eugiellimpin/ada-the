import ky from "ky";
import React, { useEffect, useState } from "react";

import "./App.css";

interface NodeContent {
  type: "text";
  body: string;
}

interface Node {
  id: string;
  title: string;
  connections?: string[];
  content?: NodeContent[];
}

interface NodesById {
  [id: string]: Node;
}

const getNodes = (nodesById: NodesById, ids: string[]) => {
  return Object.values(nodesById).filter((n) => ids.includes(n.id));
};

interface NodeItemProps {
  node: Node;
  connections: Node[];
  onClick: () => void;
}

const NodeItem = ({ node, connections, onClick }: NodeItemProps) => {
  const { id, title } = node;

  return (
    <div onClick={onClick} key={id}>
      <h2>{title}</h2>
      {connections.map((n) => (
        <h3 key={n.id}>{n.title}</h3>
      ))}
    </div>
  );
};

function App() {
  const [nodesById, setNodesById] = useState<NodesById>({});

  const fetchNode = async (id: string) => {
    // This endpoint returns an array that contains only one node
    const [fetchedNode] = await ky.get(`/nodes/${id}`).json();
    console.assert(fetchNode.length === 1);

    setNodesById((prev) => ({
      ...prev,
      [fetchedNode.id]: { ...prev[fetchedNode.id], ...fetchedNode },
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
      <div>
        {Object.values(nodesById).map((node) => (
          <NodeItem
            node={node}
            connections={getNodes(nodesById, node.connections || [])}
            onClick={() => fetchNode(node.id)}
            key={node.id}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
