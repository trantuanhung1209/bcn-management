import { FaUserPlus } from "react-icons/fa6";

export const InviteMember = (props: { teamId: string; modalId?: string }) => {
  const { teamId } = props;
  return (
    <div
      className="inner-edit p-[8px] rounded-full absolute top-[10px] right-[20px] bg-[#ffffff] shadow-md cursor-pointer hover:bg-[#f0f0f0] hover:shadow-lg transition-all duration-300 hover:text-black"
      onClick={(e) => {
        e.stopPropagation();
        const modal = document.getElementById(teamId) as HTMLDialogElement | null;
        if (modal) modal.showModal();
      }}
    >
      <FaUserPlus className="text-[#a2a2a2] text-[20px]" />
    </div>
  );
};
