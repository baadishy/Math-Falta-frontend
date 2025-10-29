<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$endpoint = $_GET['endpoint'] ?? '';
$usersFile = __DIR__ . "/users.json";
$quizzesFile = __DIR__ . "/quizzes.json";

// Load users
$users = file_exists($usersFile) ? json_decode(file_get_contents($usersFile), true) : [];

// Ensure admin always exists
if (empty($users)) {
  $users = [
    [
      "username" => "felemonfawzy@admin.com",
      "title" => "admin",
      "password" => "theAdminFelemonFawzy"
    ]
  ];
}

// Save users
function saveUsers($users, $file) {
  file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT));
}

// Filter users (hide passwords)
function filterUsers($users) {
  $filtered = [];
  foreach ($users as $user) {
    $filtered[] = [
      "title" => $user["title"] ?? "",
      "username" => $user["username"] ?? "",
      "grade" => $user["grade"] ?? "",
      "email" => $user["email"] ?? "",
      "parentNumber" => $user["parentNumber"] ?? "",
      "quizzes" => $user["quizzes"] ?? [],
      "totalScore" => $user["totalScore"] ?? 0,
      "id" => $user["id"] ?? ""
    ];
  }
  return $filtered;
}

// Helper: find user by ID
function findUserById($users, $id) {
  foreach ($users as $user) {
    if (($user["id"] ?? "") === $id) return $user;
  }
  return null;
}

// ✅ GET all users
if ($endpoint === "users") {
  echo json_encode(["success" => true, "data" => filterUsers($users)]);
  exit;
}

// ✅ POST sign up (frontend provides ID)
if ($endpoint === "sign-up" && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);

  if (!$data || !isset($data["id"])) {
    echo json_encode(["success" => false, "msg" => "Missing user ID or invalid data"]);
    exit;
  }

  foreach ($users as $user) {
    if (
      $user["username"] === $data["username"] ||
      ($user["email"] ?? "") === ($data["email"] ?? "")
    ) {
      echo json_encode(["success" => false, "msg" => "username or email already taken"]);
      exit;
    }
  }

  $data["title"] = "student";
  $data["quizzes"] = [];
  $data["totalScore"] = 0;
  $users[] = $data;
  saveUsers($users, $usersFile);

  echo json_encode(["success" => true, "data" => filterUsers($users)]);
  exit;
}

// ✅ POST sign in
if ($endpoint === "sign-in" && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);
  $found = null;

  foreach ($users as $user) {
    if ($user["username"] === $data["username"] && $user["password"] === $data["password"]) {
      $found = $user;
      break;
    }
  }

  if ($found) {
    if ($found["title"] === "admin") {
      echo json_encode(["success" => true, "url" => "nnqgx218wbrlkph.html"]);
    } else {
      echo json_encode(["success" => true, "data" => $found["id"]]);
    }
  } else {
    echo json_encode(["success" => false, "msg" => "No user found"]);
  }
  exit;
}

// ✅ GET user by ID
if ($endpoint === "user" && isset($_GET["id"])) {
  $id = $_GET["id"];
  $user = findUserById($users, $id);
  if (!$user) {
    echo json_encode(["success" => false, "msg" => "User not found"]);
    exit;
  }

  if (isset($user["quizzes"]) && count($user["quizzes"]) > 0) {
    $user["totalScore"] = array_sum(array_column($user["quizzes"], "score"));
  }

  $filtered = [
    "title" => $user["title"] ?? "",
    "grade" => $user["grade"] ?? "",
    "totalScore" => $user["totalScore"] ?? 0,
    "email" => $user["email"] ?? "",
    "username" => $user["username"] ?? "",
    "parentNumber" => $user["parentNumber"] ?? "",
    "quizzes" => $user["quizzes"] ?? []
  ];
  echo json_encode(["success" => true, "data" => $filtered]);
  exit;
}

// ✅ PUT doneQuiz
if ($endpoint === "doneQuiz" && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET["id"])) {
  $id = $_GET["id"];
  $data = json_decode(file_get_contents("php://input"), true);
  $updated = false;

  foreach ($users as &$user) {
    if (($user["id"] ?? "") === $id) {
      $user["quizzes"][] = $data;
      $user["totalScore"] = array_sum(array_column($user["quizzes"], "score"));
      $updated = true;
      break;
    }
  }

  if ($updated) {
    saveUsers($users, $usersFile);
    echo json_encode(["success" => true, "msg" => "Quiz added"]);
  } else {
    echo json_encode(["success" => false, "msg" => "User not found"]);
  }
  exit;
}

// ✅ GET quizzes
if ($endpoint === "quizzes") {
  $grade = $_GET["grade"] ?? null;
  $topic = $_GET["topic"] ?? null;

  if (!$grade || !$topic) {
    echo json_encode(["success" => false, "msg" => "grade or topic missing"]);
    exit;
  }

  if (!file_exists($quizzesFile)) {
    echo json_encode(["success" => false, "msg" => "No quizzes found"]);
    exit;
  }

  $quizzes = json_decode(file_get_contents($quizzesFile), true);
  $gradeQuizzes = null;

  foreach ($quizzes as $set) {
    if ($set[0]["grade"] == $grade) {
      $gradeQuizzes = $set;
      break;
    }
  }

  $filtered = array_values(array_filter($gradeQuizzes, fn($q) => $q["topic"] === $topic));
  echo json_encode(["success" => true, "data" => $filtered]);
  exit;
}

// ✅ GET quiz topics
if ($endpoint === "topics") {
  $grade = $_GET["grade"] ?? null;
  if (!$grade) {
    echo json_encode(["success" => false, "msg" => "no grade found"]);
    exit;
  }

  if (!file_exists($quizzesFile)) {
    echo json_encode(["success" => false, "msg" => "No quizzes file found"]);
    exit;
  }

  $quizzes = json_decode(file_get_contents($quizzesFile), true);
  $gradeQuizzes = null;

  foreach ($quizzes as $set) {
    if ($set[0]["grade"] == $grade) {
      $gradeQuizzes = $set;
      break;
    }
  }

  $topics = array_values(array_unique(array_column($gradeQuizzes, "topic")));
  echo json_encode(["success" => true, "data" => $topics]);
  exit;
}

// ❌ Invalid endpoint
echo json_encode(["success" => false, "msg" => "Invalid endpoint"]);
?>
