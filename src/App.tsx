import ky from "ky";
import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash-es";

import "./App.css";
import Details from "./components/Details";
import SearchResults from "./components/SearchResults";

interface ImageContent {
  type: "image";
  url: string;
}

interface TextContent {
  type: "text";
  body: string;
}

export interface Node {
  id: number;
  title: string;
  connections?: number[];
  content?: Array<TextContent | ImageContent>;
}

interface NodesById {
  [id: string]: Node;
}

const getNodes = (nodesById: NodesById, ids: number[]) => {
  return ids.map((id) => nodesById[id]);
};

interface NodeItemProps {
  activePath: string;
  path: number[];
  node: Node;
  onClick: (id: number, path: number[]) => void;
  depth?: number;
  getConnections: (ids: number[]) => Node[];
}

const NodeItem = ({
  activePath,
  path,
  node,
  onClick,
  depth = 0,
  getConnections,
}: NodeItemProps) => {
  const { id, title, connections } = node;
  const [isOpen, setIsOpen] = useState(path.join("-") === activePath);

  useEffect(() => {
    if (!!activePath) {
      setIsOpen(activePath.startsWith(path.join("-")));
    }
  }, [activePath, path]);

  return (
    <div key={id} className={`node depth-${depth}`}>
      <button
        onClick={() => {
          onClick(id, path);
        }}
      >
        {id} {title}
      </button>
      {isOpen &&
        depth < 2 &&
        getConnections(connections || []).map((n) => {
          return (
            <NodeItem
              activePath={activePath}
              path={[...path, n.id]}
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
  const [activeNodeIdPath, setActiveNodeIdPath] = useState<number[]>([]);
  const activeNodeId = activeNodeIdPath[activeNodeIdPath.length - 1];

  // Search
  const [showSearchResults, setShowResults] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Node[]>([]);

  const fetchNode = async (id: number) => {
    // This endpoint returns an array that contains only one node
    const [fetchedNode] = await ky.get(`/nodes/${id}`).json();
    console.assert(fetchNode.length === 1);

    setNodesById((prev) => ({
      ...prev,
      [fetchedNode.id]: fetchedNode,
    }));
  };

  const search = async (query: string) => {
    const searchResults: Node[] = await ky
      .post(`/nodes/search`, { json: { query } })
      .json();
    setSearchResults(searchResults);
    setShowResults(true);
  };

  // Fire request 500ms after user stops typing instead of firing the request
  // every keystroke
  const debouncedSearch = useMemo(() => debounce(search, 500), []);

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
        <input
          value={query}
          onChange={(e) => {
            const newQuery = e.currentTarget.value;
            setQuery(newQuery);
            // Use the newest search term value instead of the one in state
            // since setState is async and we may have an outdated value when
            // firing the search request
            debouncedSearch(newQuery);
          }}
          type="text"
          placeholder=""
          className="search"
        />

        {Object.values(nodesById).map((node) => (
          <NodeItem
            activePath={activeNodeIdPath.join("-")}
            path={[node.id]}
            node={node}
            onClick={(id: number, path: number[]) => {
              setShowResults(false);
              setActiveNodeIdPath(path);
              fetchNode(id);
            }}
            getConnections={(ids: number[]) => getNodes(nodesById, ids)}
            key={node.id}
          />
        ))}
      </div>
      <div className="details">
        {showSearchResults && <SearchResults results={searchResults} />}

        {!showSearchResults && activeNodeId && (
          <Details node={nodesById[activeNodeId]} />
        )}
      </div>
    </div>
  );
}

export default App;
