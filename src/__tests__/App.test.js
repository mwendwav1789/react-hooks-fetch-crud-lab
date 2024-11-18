import React from "react";
import "whatwg-fetch";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { server } from "../mocks/server";

import App from "../components/App";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays question prompts after fetching", async () => {
  render(<App />);

  fireEvent.click(screen.getByText(/View Questions/)); // Use getByText for better assertion

  // Wait for questions to appear in the DOM
  expect(await screen.findByText(/lorem testum 1/)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 2/)).toBeInTheDocument();
});

test("creates a new question when the form is submitted", async () => {
  render(<App />);

  // Wait for the initial list of questions to appear
  await screen.findByText(/lorem testum 1/);

  // Click the "New Question" button
  fireEvent.click(screen.getByText("New Question"));

  // Fill out the form fields
  fireEvent.change(screen.getByLabelText(/Prompt/), {
    target: { value: "Test Prompt" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 1/), {
    target: { value: "Test Answer 1" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 2/), {
    target: { value: "Test Answer 2" },
  });
  fireEvent.change(screen.getByLabelText(/Correct Answer/), {
    target: { value: "1" },
  });

  // Submit the form
  fireEvent.submit(screen.getByText(/Add Question/));

  // Wait for the form to be submitted and the new question to appear in the list
  fireEvent.click(screen.getByText(/View Questions/));

  expect(await screen.findByText(/Test Prompt/)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 1/)).toBeInTheDocument();
});

test("deletes the question when the delete button is clicked", async () => {
  const { rerender } = render(<App />);

  fireEvent.click(screen.getByText(/View Questions/));

  // Wait for the first question to appear
  await screen.findByText(/lorem testum 1/);

  // Click the "Delete Question" button for the first question
  fireEvent.click(screen.getAllByText("Delete Question")[0]);

  // Wait for the question to be removed from the DOM
  await waitForElementToBeRemoved(() => screen.queryByText(/lorem testum 1/));

  // Re-render the component
  rerender(<App />);

  // Check that the first question has been deleted
  expect(screen.queryByText(/lorem testum 1/)).not.toBeInTheDocument();

  // Check that the second question is still there
  expect(screen.getByText(/lorem testum 2/)).toBeInTheDocument();
});

test("updates the answer when the dropdown is changed", async () => {
  const { rerender } = render(<App />);

  fireEvent.click(screen.getByText(/View Questions/));

  // Wait for the second question to appear
  await screen.findByText(/lorem testum 2/);

  // Find the correct answer dropdown and change its value
  fireEvent.change(screen.getAllByLabelText(/Correct Answer/)[0], {
    target: { value: "3" },
  });

  // Verify that the dropdown's value is updated
  expect(screen.getAllByLabelText(/Correct Answer/)[0].value).toBe("3");

  // Re-render and verify the dropdown value remains updated
  rerender(<App />);

  expect(screen.getAllByLabelText(/Correct Answer/)[0].value).toBe("3");
});
