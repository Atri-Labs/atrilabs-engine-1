import { subscribeNewDrop } from "@atrilabs/canvas-runtime";
import {
  api,
  BrowserForestManager,
  getId,
  manifestRegistryController,
  useTree,
} from "@atrilabs/core";
import { useEffect } from "react";
import { getComponentIndex, getComponentIndexInsideBody } from "../utils";
import ComponentTreeId from "@atrilabs/app-design-forest/lib/componentTree?id";
import { CreateEvent, LinkEvent } from "@atrilabs/forest";

export const useSubscribeTemplateDrop = () => {
  const tree = useTree(ComponentTreeId);
  useEffect(() => {
    const unsub = subscribeNewDrop((args, loc, caughtBy) => {
      if (args.dragData.type === "template") {
        // get index
        // find manifest from manifest registry
        const manifestRegistry =
          manifestRegistryController.readManifestRegistry();
        let index = 0;
        if (caughtBy === "body") {
          index = getComponentIndexInsideBody(loc);
        } else {
          // Don't process if caughtBy/parent does not belong to component tree
          if (!tree.nodes[caughtBy]) {
            return;
          }
          index = getComponentIndex(tree, caughtBy, loc, manifestRegistry);
        }

        const forestPkgId = BrowserForestManager.currentForest.forestPkgId;
        const forestId = BrowserForestManager.currentForest.forestId;
        const { dir, name, newTemplateRootId } = args.dragData.data;

        api.getTemplateEvents(dir, name, (events) => {
          const replacementIdMap: { [oldId: string]: string } = {};

          function createOrReturnNew(oldId: string) {
            if (replacementIdMap[oldId]) {
              return replacementIdMap[oldId];
            } else {
              const newId = getId();
              replacementIdMap[oldId] = newId;
              return newId;
            }
          }
          function replaceWithId(oldId: string, newId: string) {
            replacementIdMap[oldId] = newId;
          }

          const idAliasMap: { [oldId: string]: string } = {};

          const aliasPromises = events.map((event) => {
            return new Promise<void>((resolve) => {
              if (event.type.match(/^CREATE/)) {
                const createEvent = event as CreateEvent;
                // get alias if key field exists in meta
                if (createEvent.meta["key"]) {
                  api.getNewAlias(
                    forestPkgId,
                    createEvent.meta["key"],
                    (alias) => {
                      idAliasMap[createEvent.id] = alias;
                      resolve();
                    }
                  );
                } else {
                  // resolve immidiately if no key field exists
                  resolve();
                }
              } else {
                resolve();
              }
            });
          });

          Promise.all(aliasPromises).then(() => {
            // find create event with templateRoot as parent
            // and add that to replacementIdMap
            events.forEach((event) => {
              if (event.type.match(/^CREATE/)) {
                const createEvent = event as CreateEvent;
                if (createEvent.state.parent.id === "templateRoot") {
                  replaceWithId(createEvent.id, newTemplateRootId);
                }
              }
            });
            events.forEach((event) => {
              if (event.type.match(/^CREATE/)) {
                const createEvent = event as CreateEvent;
                const oldId = createEvent.id;
                if (idAliasMap[oldId]) {
                  createEvent.state.alias = idAliasMap[oldId];
                }
                // replace all components with new id
                if (createEvent.state.parent.id === "templateRoot") {
                  createEvent.id = newTemplateRootId;
                  // templateRoot will be replaced by the parent (caughtBy) in which template is dropped
                  createEvent.state.parent = { id: caughtBy, index };
                } else {
                  createEvent.id = createOrReturnNew(createEvent.id);
                  createEvent.state.parent.id = createOrReturnNew(
                    createEvent.state.parent.id
                  );
                }
              }
              if (event.type.match(/^LINK/)) {
                const linkEvent = event as LinkEvent;
                linkEvent.childId = createOrReturnNew(linkEvent.childId);
                linkEvent.refId = createOrReturnNew(linkEvent.refId);
              }
              api.postNewEvent(forestPkgId, forestId, event);
            });
          });
        });
      }
    });
    return unsub;
  }, [tree]);
};