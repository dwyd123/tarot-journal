export type AppView =
  | { name: "list" }
  | { name: "favorites" }
  | { name: "create" }
  | { name: "calendar" }
  | { name: "deck" }
  | { name: "settings" }
  | { name: "detail"; caseId: string }
  | { name: "edit"; caseId: string };

export type AppViewName = AppView["name"];
