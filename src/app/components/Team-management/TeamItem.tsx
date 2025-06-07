import { useRouter } from "next/navigation";

interface Team {
  teamId: string;
  teamName: string;
  memberQuantity: number;
  createdAt: string;
  projectName?: string;
  deadline?: string;
}

export const TeamItem = ({ team }: { team: Team }) => {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push(`/team-management/${team.teamId}`);
      }}
      className="inner-item"
    >
      <h2 className="px-[16px] py-[8px] rounded-[8px] shadow-md bg-white mb-[16px] text-black border border-gray-300 text-start cursor-pointer hover:shadow-lg transition-shadow duration-300 hover:border-gray-500 trainsition-border">
        <p className="inner-name text-[20px] font-bold">{team.teamName}</p>
        <p className="inner-quantity">
          <strong className="text-gray-500">Số lượng thành viên:</strong> {team.memberQuantity}
        </p>
        <p className="inner-date">
          <strong className="text-gray-500">Ngày tạo:</strong>{" "}
          {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : ""}
        </p>
        <p className="inner-project">
          {team.projectName ? (
            <>
              <strong className="text-gray-500">Dự án đang triển khai:</strong> {team.projectName}
            </>
          ) : (
            <strong>Chưa có dự án nào</strong>
          )}
        </p>
        <p className="inner-deadline">
          {team.projectName ? (
            <>
              <strong className="text-gray-500">Ngày hết hạn dự án:</strong>{" "}
              {team.deadline
                ? new Date(team.deadline).toLocaleDateString()
                : "Chưa có ngày hết hạn"}
            </>
          ) : (
            <strong>Chưa có ngày hết hạn</strong>
          )}
        </p>
      </h2>
    </div>
  );
};
