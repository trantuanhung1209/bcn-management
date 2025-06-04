
interface Task {
  id?: string;
  description: string;
  deadline: string;
  content: string;
}

export const TaskItem = (props: {
  task: Task;
  index: number;
  projectId: string | null;
}) => {
  const { task, index, projectId } = props;

  return (
    <>
      <tr
        key={index}
        id={projectId ? projectId : ""}
        className="hover:bg-gray-100 transition-colors duration-200 border-b border-gray-300"
      >
        <td>{index + 1}</td>
        <td>{task.description}</td>
        <td>{task.deadline}</td>
        <td>{task.content}</td>
        <td>Chưa hoàn thành</td>
      </tr>
    </>
  );
};
