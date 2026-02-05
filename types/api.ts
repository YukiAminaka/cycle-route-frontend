import type { components } from "./api.d";

// Route関連
export type CoursePointRequest =
  components["schemas"]["route.CoursePointRequest"];
export type CoursePointResponse =
  components["schemas"]["route.CoursePointResponse"];
export type CreateRouteRequest =
  components["schemas"]["route.CreateRouteRequest"];
export type UpdateRouteRequest =
  components["schemas"]["route.UpdateRouteRequest"];
export type RouteResponse = components["schemas"]["route.RouteResponse"];
export type RouteResponseModel =
  components["schemas"]["route.RouteResponseModel"];
export type RouteListResponse =
  components["schemas"]["route.RouteListResponse"];
export type WaypointRequest = components["schemas"]["route.WaypointRequest"];
export type WaypointResponse = components["schemas"]["route.WaypointResponse"];

// User関連
export type CreateUserRequest = components["schemas"]["user.CreateUserRequest"];
export type UserResponse = components["schemas"]["user.UserResponse"];
export type UserResponseModel = components["schemas"]["user.UserResponseModel"];

// Common
export type ErrorResponse = components["schemas"]["response.ErrorResponse"];
