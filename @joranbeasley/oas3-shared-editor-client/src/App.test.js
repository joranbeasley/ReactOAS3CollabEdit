import React from "react";
import { render, screen } from '@testing-library/react';
import {LoginPage} from "./pages/LoginPage";
import {Provider} from "react-redux";
import store from "./store";

test('login page has room field', () => {
  render(
  <Provider store={store}>
    <LoginPage />
  </Provider>
  );
  const linkElement = screen.getByPlaceholderText('enter room name.');
  expect(linkElement).toBeInTheDocument();
});
