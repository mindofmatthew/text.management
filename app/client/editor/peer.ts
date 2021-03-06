import {
  Update,
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
} from "@codemirror/collab";
import { ChangeSet } from "@codemirror/state";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { sendOSCWithResponse } from "../osc";

async function pushUpdates(
  version: number,
  fullUpdates: readonly Update[]
): Promise<boolean> {
  // Strip off transaction data
  let updates = fullUpdates.map((u) =>
    JSON.stringify({
      clientID: u.clientID,
      changes: u.changes,
    })
  );
  let msg = await sendOSCWithResponse(
    ["/doc/push", version, ...updates],
    "/doc/push/done"
  );

  if (typeof msg.args[0] === "boolean") {
    return msg.args[0];
  } else {
    return false;
  }
}

async function pullUpdates(version: number): Promise<readonly Update[]> {
  let { args } = await sendOSCWithResponse(
    ["/doc/pull", version],
    "/doc/pull/done"
  );

  return (args as string[]).map((arg) => {
    let u = JSON.parse(arg);
    return { changes: ChangeSet.fromJSON(u.changes), clientID: u.clientID };
  });
}

export function peerExtension(startVersion: number) {
  let plugin = ViewPlugin.fromClass(
    class {
      private pushing = false;
      private done = false;

      constructor(private view: EditorView) {
        this.pull();
      }

      update(update: ViewUpdate) {
        if (update.docChanged) this.push();
      }

      async push() {
        let updates = sendableUpdates(this.view.state);
        if (this.pushing || !updates.length) return;
        this.pushing = true;
        let version = getSyncedVersion(this.view.state);
        await pushUpdates(version, updates);
        this.pushing = false;
        // Regardless of whether the push failed or new updates came in
        // while it was running, try again if there's updates remaining
        if (sendableUpdates(this.view.state).length)
          setTimeout(() => this.push(), 100);
      }

      async pull() {
        while (!this.done) {
          let version = getSyncedVersion(this.view.state);
          let updates = await pullUpdates(version);
          this.view.dispatch(receiveUpdates(this.view.state, updates));
        }
      }

      destroy() {
        this.done = true;
      }
    }
  );
  return [collab({ startVersion }), plugin];
}
