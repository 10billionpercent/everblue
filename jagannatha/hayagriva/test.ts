import {
  createPainting,
  getPainting,
  getPaintings,
  updatePainting,
  deletePainting,
  changePaintingStatus,
} from "./logic";

export async function runHayagrivaTest(
  userId: string,
  command: string,
) {
  const [action, ...args] = command.split(" ");

  switch (action) {
    case "list":
      return getPaintings(userId);

    case "get":
      return getPainting(args[0]);

    case "delete":
      return deletePainting(args[0]);

    case "status":
      return changePaintingStatus(
        args[0],
        args[1] as any,
      );

    default:
      return `
Commands

list
get <paintingId>
delete <paintingId>
status <paintingId> <IDEA|SKETCH|LINEART|PAINTING|DONE>

(create/update handled via actions later)
`;
  }
}