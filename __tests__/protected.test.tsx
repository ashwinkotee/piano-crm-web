import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Protected } from '../src/components/Protected';
import { useAuth } from '../src/store/auth';

function View() { return <div>OK</div>; }

describe('Protected', () => {
  it('redirects to /login when no auth', () => {
    useAuth.setState({ token: null, user: null });
    const r = render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<Protected role="admin"><View /></Protected>} />
          <Route path="/login" element={<div>LOGIN</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(r.container.textContent).toContain('LOGIN');
  });
});

