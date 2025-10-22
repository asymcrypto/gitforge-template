#!/usr/bin/env node

const { TwitterApi } = require('twitter-api-v2');

const contributor = process.argv[2];
const title = process.argv[3];
const prUrl = process.argv[4];

// Initialize Twitter client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = client.readWrite;

async function postTweet() {
  try {
    const tweet = `🎉 Bounty Completed!

Congratulations to @${contributor} for completing: "${title}"

Another step forward in decentralized collaboration! 🚀

#GitForge #OpenSource #Web3 #DAO

${prUrl}`;

    const result = await rwClient.v2.tweet(tweet);
    console.log('✅ Tweet posted successfully:', result.data.id);
  } catch (error) {
    console.error('❌ Error posting tweet:', error);
    // Don't fail the workflow if Twitter posting fails
    process.exit(0);
  }
}

postTweet();
