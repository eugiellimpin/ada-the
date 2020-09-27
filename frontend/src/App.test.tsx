import "@testing-library/jest-dom";

import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";

import App, { Node } from "./App";
import { act } from "react-dom/test-utils";

const nodes: Node[] = [
  { id: 1, title: "Node 1 title" },
  { id: 2, title: "Node 2 title" },
  { id: 3, title: "Node 3 title" },
  { id: 4, title: "Node 4 title" },
];

const server = setupServer(
  rest.get(`${process.env.API_URL}/nodes`, (req, res, ctx) => {
    return res(ctx.json(nodes));
  }),

  rest.get(`${process.env.API_URL}/nodes/1`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          ...nodes[0],
          content: [{ type: "text", body: "Node 1 content" }],
          connections: [4],
        },
      ])
    );
  }),

  rest.get(`${process.env.API_URL}/nodes/2`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          ...nodes[1],
          content: [{ type: "text", body: "Node 2 content" }],
          connections: [],
        },
      ])
    );
  }),

  rest.get(`${process.env.API_URL}/nodes/3`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          ...nodes[2],
          content: [
            {
              type: "text",
              body:
                "{v1|} Node 3 {v3|Variable 3 default} content {v2|v2-default}.",
            },
          ],
          connections: [],
        },
      ])
    );
  }),

  rest.get(`${process.env.API_URL}/variables`, (req, res, ctx) => {
    return res(
      ctx.json([
        { id: "v1", name: "Variable 1" },
        { id: "v2", name: "Variable 2" },
      ])
    );
  }),

  rest.post(`${process.env.API_URL}/nodes/search`, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          ...nodes[0],
          content: [{ type: "text", body: "Node 1 content" }],
        },
        {
          ...nodes[1],
          content: [{ type: "text", body: "Node 2 content" }],
        },
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("nodes are fetched and displayed in the sidebar", async () => {
  render(<App />);

  const initialMessage = screen.getByText(
    /select or search something to start your journey/i
  );
  expect(initialMessage).toBeInTheDocument();

  await screen.findByText(nodes[0].title);

  expect(screen.getByText(nodes[0].title)).toBeInTheDocument();
  expect(screen.getByText(nodes[1].title)).toBeInTheDocument();
  expect(screen.getByText(nodes[2].title)).toBeInTheDocument();
});

test("clicking on nodes", async () => {
  render(<App />);

  const node1 = await screen.findByText(nodes[0].title);

  fireEvent.click(node1);

  const node1Content = await screen.findByText("Node 1 content");
  expect(node1Content).toBeInTheDocument();

  // Clicking on another node closes the previous open node and opens the new
  // one

  // Assert that node 1 is open
  expect(screen.getAllByText("Node 4 title")).toHaveLength(2);

  fireEvent.click(screen.getByText("Node 2 title"));
  expect(screen.getAllByText("Node 4 title")).toHaveLength(1);

  const node2Content = await screen.findByText("Node 2 content");
  expect(node2Content).toBeInTheDocument();
});

test("variables are correctly displayed", async () => {
  render(<App />);

  const node3 = await screen.findByText(nodes[2].title);

  fireEvent.click(node3);

  const var1 = await screen.findByText("Variable 1");

  expect(var1).toBeInTheDocument();
  expect(screen.getByText("Variable 2")).toBeInTheDocument();
  expect(screen.getByText("Variable 3 default")).toBeInTheDocument();
});

test("search", async () => {
  jest.useFakeTimers();

  render(<App />);

  const node3 = await screen.findByText(nodes[2].title);
  fireEvent.click(node3);

  await screen.findByText("Variable 2");

  userEvent.type(screen.getByPlaceholderText("Search"), "ent");

  // search request is debounced
  act(() => {
    jest.advanceTimersByTime(500);
  });

  const node1content = await screen.findByText("Node 1 cont");

  expect(node1content).toBeInTheDocument();
  expect(screen.getByText('Node 2 cont')).toBeInTheDocument();

  // Detail view now displays search results instead of node 3 details
  expect(screen.queryByText('Variable 2')).not.toBeInTheDocument()

  // Wait for /variables request to finish
  await waitFor(() => {});
});
