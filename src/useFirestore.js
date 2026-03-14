import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function saveProblemProgress(userId, problemId, solved) {
  const ref = doc(db, "users", userId, "progress", "problems");
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : {};
  await setDoc(ref, { ...existing, [problemId]: solved });
}

export async function getProblemProgress(userId) {
  const ref = doc(db, "users", userId, "progress", "problems");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

export async function saveLessonProgress(userId, lessonId, completed) {
  const ref = doc(db, "users", userId, "progress", "lessons");
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : {};
  await setDoc(ref, { ...existing, [lessonId]: completed });
}

export async function getLessonProgress(userId) {
  const ref = doc(db, "users", userId, "progress", "lessons");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

export async function saveScore(userId, score, total, timeSpent) {
  const ref = doc(db, "users", userId, "scores", Date.now().toString());
  await setDoc(ref, {
    score,
    total,
    timeSpent,
    playedAt: new Date().toISOString()
  });
}