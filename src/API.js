//This is the Auth token, you will use it to generate a meeting and connect to it
export const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI5YTcwZWFiNS1lZGUzLTQ2NGUtODllYS1mNmY2MjNhNjA0YjYiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczMDkyMjU0NSwiZXhwIjoxNzYyNDU4NTQ1fQ.61pgTL01Al9aCgVDHRNZlEf_34SQVGKGk3XNyGtvvj0";
// API call to create a meeting
export const createMeeting = async ({ token }) => {
    const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
        method: "POST",
        headers: {
            authorization: `${authToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });
    //Destructuring the roomId from the response
    const { roomId } = await res.json();
    return roomId;
};