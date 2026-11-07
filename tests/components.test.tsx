// @vitest-environment jsdom
import { createRef, useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {
  Button,
  ButtonLink,
  Input,
  Textarea,
  Tag,
  Panel,
  Field,
  Modal,
  cn,
} from '../src/components';

afterEach(cleanup);

test.each(['primary', 'secondary', 'danger'] as const)(
  'Button renders its %s variant class and native props',
  async (variant) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button variant={variant} onClick={onClick} ref={ref} className="custom">
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('ds-button', `ds-button--${variant}`, 'custom');
    expect(button).toHaveAttribute('type', 'button');
    expect(ref.current).toBe(button);
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  },
);

test('Button defaults to primary, permits submit, and respects disabled', async () => {
  const onClick = vi.fn();
  render(
    <Button type="submit" disabled onClick={onClick}>
      Save
    </Button>,
  );
  const button = screen.getByRole('button');
  expect(button).toHaveClass('ds-button--primary');
  expect(button).toHaveAttribute('type', 'submit');
  await userEvent.setup().click(button);
  expect(onClick).not.toHaveBeenCalled();
});

test('ButtonLink is a native anchor with the same variants', () => {
  render(
    <ButtonLink
      href="/settings"
      variant="secondary"
      target="_blank"
      className="custom"
    >
      Settings
    </ButtonLink>,
  );
  expect(screen.getByRole('link')).toHaveAttribute('href', '/settings');
  expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  expect(screen.getByRole('link')).toHaveClass(
    'ds-button',
    'ds-button--secondary',
    'custom',
  );
});

test('Input and Textarea preserve native editing, attributes, classes and refs', async () => {
  const ref = createRef<HTMLInputElement>();
  render(
    <>
      <Input aria-label="Name" ref={ref} className="custom" required />
      <Textarea aria-label="Notes" rows={4} />
    </>,
  );
  const input = screen.getByRole('textbox', { name: 'Name' });
  const textarea = screen.getByRole('textbox', { name: 'Notes' });
  expect(input).toHaveClass('ds-control', 'custom');
  expect(input).toBeRequired();
  expect(ref.current).toBe(input);
  expect(textarea).toHaveClass('ds-control', 'ds-textarea');
  expect(textarea).toHaveAttribute('rows', '4');
  const user = userEvent.setup();
  await user.type(input, 'Ada');
  await user.type(textarea, 'Hello');
  expect(input).toHaveValue('Ada');
  expect(textarea).toHaveValue('Hello');
});

test.each(['neutral', 'success', 'warning', 'danger', 'info'] as const)(
  'Tag renders the %s tone',
  (tone) => {
    render(
      <Tag tone={tone} className="custom">
        Status
      </Tag>,
    );
    expect(screen.getByText('Status')).toHaveClass(
      'ds-tag',
      `ds-tag--${tone}`,
      'custom',
    );
  },
);

test('Tag defaults to neutral', () => {
  render(<Tag>Status</Tag>);
  expect(screen.getByText('Status')).toHaveClass('ds-tag--neutral');
});

test('Panel retains title/actions/body composition and class overrides', () => {
  const { container, rerender } = render(
    <Panel
      title="Profile"
      actions={<Button>Edit</Button>}
      className="root"
      headerClassName="header"
      bodyClassName="body"
    >
      Details
    </Panel>,
  );
  expect(container.querySelector('section')).toHaveClass('ds-panel', 'root');
  expect(container.querySelector('header')).toHaveClass(
    'ds-panel-header',
    'header',
  );
  expect(screen.getByText('Details')).toHaveClass('ds-panel-body', 'body');
  expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  rerender(<Panel actions={<Button>Edit</Button>}>Details</Panel>);
  expect(container.querySelector('header')).toBeNull();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('Field wires label, hint and error, preserving existing IDs and descriptions', async () => {
  const { rerender } = render(
    <>
      <span id="existing">Existing description.</span>
      <Field
        label="Email"
        hint="Use your work email."
        error="Email is required."
      >
        <Input id="email" aria-describedby="existing" />
      </Field>
    </>,
  );
  const input = screen.getByRole('textbox', { name: 'Email' });
  expect(input).toHaveAttribute('id', 'email');
  expect(input).toHaveAccessibleDescription(
    'Existing description. Use your work email. Email is required.',
  );
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('alert')).toHaveTextContent('Email is required.');
  await userEvent.setup().click(screen.getByText('Email'));
  expect(input).toHaveFocus();
  rerender(
    <Field label="Email" hint="Optional">
      <Input />
    </Field>,
  );
  expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute(
    'aria-invalid',
  );
  expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Optional');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('Field supports noninteractive labels and distinct generated description IDs', () => {
  render(
    <>
      <Field label="First" hint="First hint" interactiveLabel={false}>
        <Input />
      </Field>
      <Field label="Second" hint="Second hint">
        <Textarea />
      </Field>
    </>,
  );
  const first = screen.getByRole('textbox', { name: 'First' });
  const second = screen.getByRole('textbox', { name: 'Second' });
  expect(first.closest('label')).toBeNull();
  expect(first).toHaveAccessibleDescription('First hint');
  expect(second).toHaveAccessibleDescription('Second hint');
  expect(first.getAttribute('aria-describedby')).not.toBe(
    second.getAttribute('aria-describedby'),
  );
});

test('Field preserves arbitrary grouped children without attaching control attributes to a wrapper', () => {
  render(
    <Field label="Grouped" hint="Wire each control explicitly">
      <div data-testid="group">
        <Input aria-label="First" />
        <Input aria-label="Second" />
      </div>
    </Field>,
  );
  expect(screen.getByTestId('group')).not.toHaveAttribute('aria-describedby');
  expect(screen.getByTestId('group')).not.toHaveAttribute('id');
});

test('Modal contains focus, closes on Escape, and restores trigger focus through React Aria', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Button>Outside</Button>
        <Modal
          open={open}
          title="Edit profile"
          onClose={() => {
            onClose();
            setOpen(false);
          }}
          footer={<Button>Save</Button>}
        >
          <Input aria-label="Name" />
          <Button>Inside</Button>
        </Modal>
      </>
    );
  }
  render(<Example />);
  const trigger = screen.getByRole('button', { name: 'Open modal' });
  await user.click(trigger);
  const dialog = await screen.findByRole('dialog', { name: 'Edit profile' });
  await waitFor(() =>
    expect(dialog.contains(document.activeElement)).toBe(true),
  );
  const close = within(dialog).getByRole('button', { name: 'Close' });
  const save = within(dialog).getByRole('button', { name: 'Save' });
  save.focus();
  await user.tab();
  expect(close).toHaveFocus();
  await user.tab({ shift: true });
  expect(save).toHaveFocus();
  for (let i = 0; i < 6; i++) {
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  }
  await user.keyboard('{Escape}');
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(onClose).toHaveBeenCalledOnce();
  await waitFor(() => expect(trigger).toHaveFocus());
});

test('Modal preserves busy dismissal blocking, close action, footer and class hooks', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const { rerender } = render(
    <Modal
      open
      title="Confirm"
      busy
      onClose={onClose}
      className="shell"
      bodyClassName="body"
      footer={<Button>Confirm</Button>}
    >
      <p>Content</p>
    </Modal>,
  );
  const dialog = screen.getByRole('dialog', { name: 'Confirm' });
  expect(dialog.parentElement).toHaveClass(
    'ds-modal',
    'ds-modal--with-footer',
    'shell',
  );
  expect(screen.getByText('Content').parentElement).toHaveClass(
    'ds-modal-body',
    'body',
  );
  expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: 'Close' }));
  await user.click(dialog.parentElement!.parentElement!);
  expect(onClose).not.toHaveBeenCalled();
  rerender(
    <Modal open title="Confirm" onClose={onClose}>
      <p>Content</p>
    </Modal>,
  );
  await user.click(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(screen.getByRole('dialog').parentElement).not.toHaveClass(
    'ds-modal--with-footer',
  );
  rerender(
    <Modal open={false} title="Confirm" onClose={onClose}>
      Content
    </Modal>,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('Modal delegates outside dismissal to React Aria when not busy', async () => {
  const onClose = vi.fn();
  render(
    <Modal open title="Confirm" onClose={onClose}>
      Content
    </Modal>,
  );
  const overlay = screen.getByRole('dialog').parentElement!.parentElement!;
  await userEvent.setup().click(overlay);
  expect(onClose).toHaveBeenCalledOnce();
});

test('cn matches product conditional merging and Tailwind conflict resolution', () => {
  expect(cn('px-2', false, { custom: true }, ['px-4'])).toBe('custom px-4');
});
