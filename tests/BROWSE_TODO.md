# Browser verification / browse todo

- [x] Inspect app/riso components at 1000px and the modal at 390px using an
      in-repository temporary Vite fixture (removed after verification).
- [x] Verify a contained Tab and Escape closure in one browser call. At 390px,
      the modal measured 358px wide and its body used Archivo.
- [ ] Investigate an intermittent browse automation detachment (not reproduced
      by the package's jsdom test or the subsequent single-call browser check).
      Browse 0.0.10, relay build `2026-11-05T16:47:59.839Z`, session `mcp-dd006b58`,
      local preview `http://127.0.0.1:4173/.components-preview.html`.
      Reproduction: open a controlled Modal in one execute, capture its screenshot,
      then in a separate execute call `dialog.getByRole('button', {name: 'Save'}).focus()`.
      Expected: the footer button receives focus. Actual: `locator.focus: Timeout
30000ms exceeded`, with `element was detached from the DOM, retrying`.
      Recovery: a fresh snapshot showed the closed modal; reopening and checking
      Tab/Escape together succeeded. No production focus workaround was added.
