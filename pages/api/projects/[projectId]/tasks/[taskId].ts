import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../../lib/mongodb";

interface Task {
  id: string;
  description: string;
  deadline: string;
  content: string;
}

interface Project {
  projectId: string;
  projectName: string;
  projectType: string;
  projectLevel: string;
  projectDeadline: string;
  projectDescription: string;
  fileName: string;
  fileUrl: string;
  tasks: Task[];
  projectStatus: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId, taskId } = req.query;

  const taskIdStr = Array.isArray(taskId) ? taskId[0] : taskId;

  if (!taskIdStr) {
    return res.status(400).json({ success: false, message: "Missing taskId" });
  }

  if (req.method === "DELETE") {
    try {
      const client = await clientPromise;
      const db = client.db("bcn_management");
      const result = await db
        .collection<Project>("projects")
        .updateOne(
          { projectId: projectId as string },
          { $pull: { tasks: { id: taskIdStr } } }
        );
      if (result.modifiedCount > 0) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ success: false, message: "Task not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
