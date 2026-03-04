import { useGetAuthedUserInfoQuery } from "@/services/authApi";


export const useCheckIsAuthedsProfile = ({profileId} : {profileId : string | undefined}) => {
    const { data : authedUser } = useGetAuthedUserInfoQuery();
    const isAuthedUser: boolean = (authedUser?.id === profileId);
    return {isAuthedUser}
}