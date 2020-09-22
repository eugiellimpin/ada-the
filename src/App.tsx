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
  connections?: Node[];
  content?: NodeContent[];
}

interface NodesById {
  [id: string]: Node;
}

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
      <ul>
        {Object.values(nodesById).map(({ id, title }) => (
          <li onClick={() => fetchNode(id)} key={id}>
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
