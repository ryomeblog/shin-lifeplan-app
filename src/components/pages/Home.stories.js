import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

export default {
  title: 'Pages/Home',
  component: Home,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = {
  args: {},
};

export const WithSampleBackground = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ fontFamily: 'system-ui, sans-serif' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};
