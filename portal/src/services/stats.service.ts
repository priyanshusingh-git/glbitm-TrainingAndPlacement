export interface LeetCodeStats {
 totalSolved: number;
 easy: number;
 medium: number;
 hard: number;
 rating: number;
}

export const fetchLeetCodeStats = async (username: string): Promise<LeetCodeStats | null> => {
 try {
 const query = `
 query userProblemsSolved($username: String!) {
 matchedUser(username: $username) {
 submitStats {
 acSubmissionNum {
 difficulty
 count
 }
 }
 }
 }
 `;

 const response = await fetch('https://leetcode.com/graphql', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'User-Agent': 'Mozilla/5.0 (compatible; CDC-Platform/1.0;)'
 },
 body: JSON.stringify({
 query,
 variables: { username }
 })
 });

 if (!response.ok) return null;

 const result = await response.json();

 if (result.errors) {
 console.error("LeetCode GraphQL Error:", result.errors);
 return null;
 }

 const data = result.data;
 if (!data.matchedUser) return null;

 const stats = data.matchedUser.submitStats.acSubmissionNum;
 const total = stats.find((s: any) => s.difficulty === 'All')?.count || 0;
 const easy = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
 const medium = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
 const hard = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

 return {
 totalSolved: total,
 easy,
 medium,
 hard,
 rating: 0
 };

 } catch (error) {
 console.error(`Failed to fetch LeetCode stats for ${username}:`, error);
 return null;
 }
};

export const fetchCodeforcesStats = async (username: string): Promise<LeetCodeStats | null> => {
 try {
 const userInfoRes = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
 if (!userInfoRes.ok) return null;
 const userInfoData = await userInfoRes.json();
 const rating = userInfoData.result[0]?.rating || 0;

 const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`);
 if (!statusRes.ok) return null;
 const statusData = await statusRes.json();
 const submissions = statusData.result;

 const solved = new Set();
 const easySet = new Set();
 const mediumSet = new Set();
 const hardSet = new Set();

 submissions.forEach((sub: any) => {
 if (sub.verdict === 'OK') {
 const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
 solved.add(problemId);

 const difficulty = sub.problem.rating;
 if (difficulty) {
 if (difficulty < 1200) easySet.add(problemId);
 else if (difficulty < 1600) mediumSet.add(problemId);
 else hardSet.add(problemId);
 }
 }
 });

 return {
 totalSolved: solved.size,
 easy: easySet.size,
 medium: mediumSet.size,
 hard: hardSet.size,
 rating
 };

 } catch (error) {
 console.error(`Failed to fetch Codeforces stats for ${username}:`, error);
 return null;
 }
};
