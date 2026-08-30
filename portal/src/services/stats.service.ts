export interface ComprehensiveStats {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  rating: number;
  maxRating?: number;
  rankTitle?: string;
  stars?: number | string;
  globalRank?: number | string;
  countryRank?: number | string;
  acceptanceRate?: number;
  attendedContests?: number;
  topPercentage?: number;
  badgesCount?: number;
  streak?: number;
  score?: number;
  contribution?: number;
  publicRepos?: number;
  followers?: number;
  totalStars?: number;
  topLanguages?: string[];
  bio?: string;
  avatarUrl?: string;
  lastRefreshed?: string;
  [key: string]: any;
}

export type LeetCodeStats = ComprehensiveStats;

/**
 * Fetch comprehensive stats for LeetCode
 */
export const fetchLeetCodeStats = async (username: string): Promise<ComprehensiveStats | null> => {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) return null;

  try {
    const query = `
      query getUserComprehensiveData($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            reputation
            starRating
            userAvatar
            realName
            aboutMe
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          badges {
            id
            displayName
            icon
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          topPercentage
          badge {
            name
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `https://leetcode.com/u/${cleanUsername}/`
      },
      body: JSON.stringify({
        query,
        variables: { username: cleanUsername }
      }),
      next: { revalidate: 3600 }
    });

    if (response.ok) {
      const result = await response.json();
      if (!result.errors && result.data?.matchedUser) {
        const data = result.data;
        const acStats = data.matchedUser.submitStats?.acSubmissionNum || [];
        const totalSubStats = data.matchedUser.submitStats?.totalSubmissionNum || [];

        const total = acStats.find((s: any) => s.difficulty === 'All')?.count || 0;
        const easy = acStats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
        const medium = acStats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
        const hard = acStats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

        const totalAcSubmissions = acStats.find((s: any) => s.difficulty === 'All')?.submissions || total;
        const totalAllSubmissions = totalSubStats.find((s: any) => s.difficulty === 'All')?.submissions || 0;
        const acceptanceRate = totalAllSubmissions > 0
          ? Math.round((totalAcSubmissions / totalAllSubmissions) * 1000) / 10
          : 0;

        const contestRanking = data.userContestRanking;
        const contestRating = contestRanking?.rating ? Math.round(contestRanking.rating) : 0;
        const globalContestRank = contestRanking?.globalRanking || 0;
        const topPercentage = contestRanking?.topPercentage ? Math.round(contestRanking.topPercentage * 10) / 10 : 0;
        const rankTitle = contestRanking?.badge?.name || (contestRating >= 2100 ? 'Guardian' : contestRating >= 1600 ? 'Knight' : undefined);

        return {
          totalSolved: total,
          easy,
          medium,
          hard,
          rating: contestRating,
          rankTitle,
          globalRank: globalContestRank || data.matchedUser.profile?.ranking || 0,
          acceptanceRate,
          attendedContests: contestRanking?.attendedContestsCount || 0,
          topPercentage,
          badgesCount: data.matchedUser.badges?.length || 0,
          avatarUrl: data.matchedUser.profile?.userAvatar,
          lastRefreshed: new Date().toISOString()
        };
      }
    }

    // Fallback to public mirror API if direct GraphQL was rate limited
    const mirrorRes = await fetch(`https://leetcode-stats-api.herokuapp.com/${cleanUsername}`);
    if (mirrorRes.ok) {
      const mirrorData = await mirrorRes.json();
      if (mirrorData.status === 'success') {
        return {
          totalSolved: mirrorData.totalSolved || 0,
          easy: mirrorData.easySolved || 0,
          medium: mirrorData.mediumSolved || 0,
          hard: mirrorData.hardSolved || 0,
          rating: mirrorData.ranking ? Math.max(0, 2000 - Math.round(mirrorData.ranking / 1000)) : 0,
          globalRank: mirrorData.ranking || 0,
          acceptanceRate: mirrorData.acceptanceRate || 0,
          lastRefreshed: new Date().toISOString()
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch LeetCode stats for ${username}:`, error);
    return null;
  }
};

/**
 * Fetch comprehensive stats for GitHub
 */
export const fetchGitHubStats = async (username: string): Promise<ComprehensiveStats | null> => {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) return null;

  try {
    const userRes = await fetch(`https://api.github.com/users/${cleanUsername}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TNP-Portal'
      }
    });

    if (!userRes.ok) return null;
    const userData = await userRes.json();

    // Fetch user public repos to estimate stars and languages
    let totalStars = 0;
    const languagesMap: Record<string, number> = {};

    try {
      const reposRes = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=30&sort=pushed`, {
        headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'TNP-Portal' }
      });
      if (reposRes.ok) {
        const repos = await reposRes.json();
        if (Array.isArray(repos)) {
          repos.forEach((repo: any) => {
            totalStars += repo.stargazers_count || 0;
            if (repo.language) {
              languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
            }
          });
        }
      }
    } catch {
      // Ignore repo list error
    }

    const topLanguages = Object.entries(languagesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    return {
      totalSolved: userData.public_repos || 0,
      easy: userData.public_gists || 0,
      medium: totalStars,
      hard: userData.followers || 0,
      rating: Math.min(2500, (userData.public_repos * 20) + (totalStars * 50) + (userData.followers * 15)),
      publicRepos: userData.public_repos || 0,
      followers: userData.followers || 0,
      totalStars,
      topLanguages,
      bio: userData.bio || undefined,
      avatarUrl: userData.avatar_url,
      rankTitle: totalStars > 50 ? 'Prolific Contributor' : userData.public_repos > 15 ? 'Active Developer' : 'Builder',
      lastRefreshed: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Failed to fetch GitHub stats for ${username}:`, error);
    return null;
  }
};

/**
 * Fetch comprehensive stats for Codeforces
 */
export const fetchCodeforcesStats = async (username: string): Promise<ComprehensiveStats | null> => {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) return null;

  try {
    const userInfoRes = await fetch(`https://codeforces.com/api/user.info?handles=${cleanUsername}`);
    if (!userInfoRes.ok) return null;
    const userInfoData = await userInfoRes.json();
    if (userInfoData.status !== 'OK' || !userInfoData.result?.[0]) return null;

    const user = userInfoData.result[0];
    const rating = user.rating || 0;
    const maxRating = user.maxRating || rating;
    const rankTitle = user.rank ? (user.rank.charAt(0).toUpperCase() + user.rank.slice(1)) : undefined;

    // Fetch submissions to calculate unique problems solved by difficulty
    const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${cleanUsername}&from=1&count=10000`);
    const solved = new Set<string>();
    const easySet = new Set<string>();
    const mediumSet = new Set<string>();
    const hardSet = new Set<string>();

    if (statusRes.ok) {
      const statusData = await statusRes.json();
      if (statusData.status === 'OK' && Array.isArray(statusData.result)) {
        statusData.result.forEach((sub: any) => {
          if (sub.verdict === 'OK' && sub.problem) {
            const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
            solved.add(problemId);

            const difficulty = sub.problem.rating;
            if (difficulty) {
              if (difficulty < 1200) easySet.add(problemId);
              else if (difficulty < 1600) mediumSet.add(problemId);
              else hardSet.add(problemId);
            } else {
              easySet.add(problemId);
            }
          }
        });
      }
    }

    // Fetch contest history count
    let attendedContests = 0;
    try {
      const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${cleanUsername}`);
      if (ratingRes.ok) {
        const ratingData = await ratingRes.json();
        if (ratingData.status === 'OK') {
          attendedContests = ratingData.result?.length || 0;
        }
      }
    } catch {}

    return {
      totalSolved: solved.size,
      easy: easySet.size,
      medium: mediumSet.size,
      hard: hardSet.size,
      rating,
      maxRating,
      rankTitle,
      contribution: user.contribution || 0,
      attendedContests,
      avatarUrl: user.avatar || user.titlePhoto,
      lastRefreshed: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Failed to fetch Codeforces stats for ${username}:`, error);
    return null;
  }
};

/**
 * Fetch comprehensive stats for CodeChef
 */
export const fetchCodeChefStats = async (username: string): Promise<ComprehensiveStats | null> => {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) return null;

  try {
    // Try public CodeChef proxy API
    const res = await fetch(`https://codechef-api.vercel.app/${cleanUsername}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success !== false && (data.currentRating || data.stars || data.globalRank)) {
        const currentRating = Number(data.currentRating) || 0;
        const highestRating = Number(data.highestRating) || currentRating;
        const starsStr = data.stars || (currentRating >= 2500 ? '7★' : currentRating >= 2200 ? '6★' : currentRating >= 2000 ? '5★' : currentRating >= 1800 ? '4★' : currentRating >= 1600 ? '3★' : currentRating >= 1400 ? '2★' : '1★');
        const solved = Number(data.totalProblemsSolved || data.problemsSolved) || 0;

        return {
          totalSolved: solved,
          easy: Math.round(solved * 0.5),
          medium: Math.round(solved * 0.35),
          hard: Math.max(0, solved - Math.round(solved * 0.5) - Math.round(solved * 0.35)),
          rating: currentRating,
          maxRating: highestRating,
          stars: starsStr,
          globalRank: data.globalRank || undefined,
          countryRank: data.countryRank || undefined,
          rankTitle: `Division ${data.division || (currentRating >= 2000 ? '1' : currentRating >= 1600 ? '2' : currentRating >= 1400 ? '3' : '4')}`,
          avatarUrl: data.profile || undefined,
          lastRefreshed: new Date().toISOString()
        };
      }
    }

    // Direct scraping fallback if proxy fails
    const pageRes = await fetch(`https://www.codechef.com/users/${cleanUsername}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (pageRes.ok) {
      const html = await pageRes.text();
      const ratingMatch = html.match(/class="rating-number">(\d+)<\/div>/);
      const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;
      const starsMatch = html.match(/class="rating-star">([\s\S]*?)<\/div>/);
      const starsCount = starsMatch ? (starsMatch[1].match(/★/g) || []).length : 0;
      const globalRankMatch = html.match(/Global Rank:\s*<a[^>]*><strong>(\d+)<\/strong>/i);
      const globalRank = globalRankMatch ? parseInt(globalRankMatch[1], 10) : 0;

      const solvedMatch = html.match(/Problems Solved:\s*<strong>(\d+)<\/strong>/i) || html.match(/Total Problems Solved:\s*(\d+)/i);
      const totalSolved = solvedMatch ? parseInt(solvedMatch[1], 10) : 0;

      return {
        totalSolved: totalSolved,
        easy: Math.round(totalSolved * 0.5),
        medium: Math.round(totalSolved * 0.35),
        hard: Math.max(0, totalSolved - Math.round(totalSolved * 0.5) - Math.round(totalSolved * 0.35)),
        rating,
        maxRating: rating,
        stars: starsCount > 0 ? `${starsCount}★` : (rating >= 1600 ? '3★' : rating >= 1400 ? '2★' : '1★'),
        globalRank: globalRank || undefined,
        lastRefreshed: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch CodeChef stats for ${username}:`, error);
    return null;
  }
};

/**
 * Fetch stats for GeeksforGeeks
 */
export const fetchGeeksforGeeksStats = async (username: string): Promise<ComprehensiveStats | null> => {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) return null;

  try {
    const res = await fetch(`https://geeks-for-geeks-stats-api.vercel.app/?raw=Y&userName=${cleanUsername}`);
    if (res.ok) {
      const data = await res.json();
      if (data.totalProblemsSolved !== undefined || data.codingScore !== undefined) {
        const total = Number(data.totalProblemsSolved) || 0;
        const easy = Number(data.easyProblemsSolved || data.schoolProblemsSolved || 0) + Number(data.basicProblemsSolved || 0);
        const medium = Number(data.mediumProblemsSolved) || 0;
        const hard = Number(data.hardProblemsSolved) || 0;
        const score = Number(data.codingScore) || 0;

        return {
          totalSolved: total,
          easy: easy || Math.round(total * 0.5),
          medium: medium || Math.round(total * 0.35),
          hard: hard || Math.max(0, total - easy - medium),
          rating: score,
          score,
          globalRank: data.instituteRank || data.overallRank || undefined,
          rankTitle: score > 500 ? 'Geek Master' : score > 200 ? 'Geek Scholar' : 'Geek Explorer',
          lastRefreshed: new Date().toISOString()
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch GeeksforGeeks stats for ${username}:`, error);
    return null;
  }
};

/**
 * Fetch stats for HackerRank
 */
export const fetchHackerRankStats = async (username: string): Promise<ComprehensiveStats | null> => {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) return null;

  try {
    const res = await fetch(`https://www.hackerrank.com/rest/hackers/${cleanUsername}/scores_elo`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        let totalScore = 0;
        data.forEach((track: any) => {
          totalScore += track.score || 0;
        });

        const estimatedSolved = Math.round(totalScore / 25) || data.length * 5;
        return {
          totalSolved: estimatedSolved,
          easy: Math.round(estimatedSolved * 0.5),
          medium: Math.round(estimatedSolved * 0.35),
          hard: Math.max(0, estimatedSolved - Math.round(estimatedSolved * 0.5) - Math.round(estimatedSolved * 0.35)),
          rating: Math.round(totalScore),
          score: Math.round(totalScore),
          badgesCount: data.length,
          rankTitle: `${data.length} Badges Earned`,
          lastRefreshed: new Date().toISOString()
        };
      }
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch HackerRank stats for ${username}:`, error);
    return null;
  }
};

/**
 * Universal platform dispatcher
 */
export const fetchPlatformStats = async (platform: string, username: string): Promise<ComprehensiveStats | null> => {
  const normPlatform = platform.toLowerCase().trim();

  if (normPlatform === 'leetcode') {
    return await fetchLeetCodeStats(username);
  } else if (normPlatform === 'github') {
    return await fetchGitHubStats(username);
  } else if (normPlatform === 'codeforces') {
    return await fetchCodeforcesStats(username);
  } else if (normPlatform === 'codechef') {
    return await fetchCodeChefStats(username);
  } else if (normPlatform === 'geeksforgeeks' || normPlatform === 'gfg') {
    return await fetchGeeksforGeeksStats(username);
  } else if (normPlatform === 'hackerrank') {
    return await fetchHackerRankStats(username);
  }

  return null;
};
