import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  verifyUserPassword,
  createSession,
  getSession,
  deleteSession,
} from "./logic";

export async function runSankarsanaTest(command: string) {
  const [action, ...args] = command.trim().split(" ");

  switch (action) {
    case "create": {
      const [username, password] = args;

      if (!username || !password) {
        return "Usage: create <username> <password>";
      }

      return createUser({
        username,
        password,
      });
    }

    case "get": {
      const [id] = args;

      if (!id) {
        return "Usage: get <userId>";
      }

      return getUser(id);
    }

    case "verify": {
      const [username, password] = args;

      if (!username || !password) {
        return "Usage: verify <username> <password>";
      }

      return verifyUserPassword({
        username,
        password,
      });
    }

    case "delete": {
      const [id] = args;

      if (!id) {
        return "Usage: delete <userId>";
      }

      return deleteUser(id);
    }

    case "session": {
      const [userId] = args;

      if (!userId) {
        return "Usage: session <userId>";
      }

      return createSession(userId);
    }

    case "get-session": {
      const [token] = args;

      if (!token) {
        return "Usage: get-session <token>";
      }

      return getSession(token);
    }

    case "delete-session": {
      const [sessionId] = args;

      if (!sessionId) {
        return "Usage: delete-session <sessionId>";
      }

      return deleteSession(sessionId);
    }

    default:
      return `
Commands:

create <username> <password>
get <userId>
verify <username> <password>
delete <userId>
session <userId>
get-session <token>
delete-session <sessionId>
`;
  }
}
