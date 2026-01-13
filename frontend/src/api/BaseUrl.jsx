const Node_Env = "production"

export const API_BASE = Node_Env === "production" ? "https://api-galleryhub.cloudcoderhub.in/api/v1" : "http://localhost:7640/api/v1"