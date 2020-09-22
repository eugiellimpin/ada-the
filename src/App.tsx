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
        {Object.values(nodesById).map(({ id, title, connections }) => (
          <div onClick={() => fetchNode(id)} key={id}>
            <h2>{title}</h2>
            {connections &&
              getNodes(nodesById, connections).map((n) => <h3>{n.title}</h3>)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
