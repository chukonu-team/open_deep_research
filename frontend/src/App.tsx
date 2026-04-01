import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import TaskListPage from "./pages/TaskListPage";
import NewResearchPage from "./pages/NewResearchPage";
import TaskDetailPage from "./pages/TaskDetailPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TaskListPage />} />
        <Route path="/new" element={<NewResearchPage />} />
        <Route path="/task/:threadId" element={<TaskDetailPage />} />
      </Routes>
    </Layout>
  );
}
