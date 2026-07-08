import { Resend } from 'resend'
import axios from 'axios'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDigestEmail(
  to: string,
  digest: {
    weekOf: Date
    prsReviewed: number
    flagsRaised: number
    flagsApproved: number
    flagsDismissed: number
    topIssue: string | null
    topDismissed: string | null
    patternsLearned: number
    orgLogin: string
  }
) {
  const weekStr = digest.weekOf.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  await resend.emails.send({
    from: 'PR Review Agent <digest@yourdomain.com>',
    to,
    subject: `📊 Weekly Code Review Digest — Week of ${weekStr}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>📊 Weekly Code Review Digest</h2>
        <p>Week of ${weekStr} — ${digest.orgLogin}</p>

        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #eee;">PRs Reviewed</td>
            <td style="padding: 8px; border: 1px solid #eee;"><strong>${digest.prsReviewed}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee;">Flags Raised</td>
            <td style="padding: 8px; border: 1px solid #eee;"><strong>${digest.flagsRaised}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee;">Flags Approved</td>
            <td style="padding: 8px; border: 1px solid #eee;"><strong>${digest.flagsApproved}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee;">Flags Dismissed</td>
            <td style="padding: 8px; border: 1px solid #eee;"><strong>${digest.flagsDismissed}</strong></td>
          </tr>
        </table>

        ${digest.topIssue ? `
        <h3>🔴 Most Common Issue</h3>
        <p>${digest.topIssue}</p>
        ` : ''}

        ${digest.topDismissed ? `
        <h3>🟢 Most Dismissed Rule</h3>
        <p>${digest.topDismissed}</p>
        ` : ''}

        <h3>🧠 Patterns Learned</h3>
        <p>${digest.patternsLearned} new patterns learned this week</p>
      </div>
    `
  })

  console.log(`Digest email sent to ${to}`)
}

export async function sendDigestSlack(digest: {
  weekOf: Date
  prsReviewed: number
  flagsRaised: number
  flagsApproved: number
  flagsDismissed: number
  topIssue: string | null
  topDismissed: string | null
  patternsLearned: number
  orgLogin: string
}) {
  if (!process.env.SLACK_WEBHOOK_URL) return

  const weekStr = digest.weekOf.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: `📊 *Weekly Code Review Digest — Week of ${weekStr}*`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📊 Weekly Digest — ${digest.orgLogin}`
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*PRs Reviewed:*\n${digest.prsReviewed}` },
          { type: 'mrkdwn', text: `*Flags Raised:*\n${digest.flagsRaised}` },
          { type: 'mrkdwn', text: `*Approved:*\n${digest.flagsApproved}` },
          { type: 'mrkdwn', text: `*Dismissed:*\n${digest.flagsDismissed}` }
        ]
      },
      ...(digest.topIssue ? [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🔴 *Most Common Issue:*\n${digest.topIssue}`
        }
      }] : []),
      ...(digest.topDismissed ? [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🟢 *Most Dismissed:*\n${digest.topDismissed}`
        }
      }] : []),
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🧠 *${digest.patternsLearned} new patterns learned this week*`
        }
      }
    ]
  })

  console.log('Digest sent to Slack')
}