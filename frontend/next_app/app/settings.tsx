let API_SERVER_VAL: string = "";

switch (process.env.NODE_ENV) {
  case "development":
    API_SERVER_VAL = "http://localhost:8000";
    break;
  case "production":
    API_SERVER_VAL = process.env.NEXT_APP_API_SERVER;
    break;
  default:
    API_SERVER_VAL = "http://localhost:8000";
    break;
}

export const API_SERVER = API_SERVER_VAL;

export const SESSION_DURATION = 5 * 3600 * 1000;
