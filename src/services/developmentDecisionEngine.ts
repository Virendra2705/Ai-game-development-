import { AutonomousRun, AutonomousMode } from '../types';

export type DecisionAction =
  | 'CONTINUE'
  | 'RETRY'
  | 'DEBUG'
  | 'IMPROVE'
  | 'WAIT_FOR_HUMAN'
  | 'STOP';

export interface DecisionEvaluation {
  action: DecisionAction;
  reason: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requestedAction?: string;
  recommendedDecision?: string;
  isStopCondition: boolean;
}

class DevelopmentDecisionEngine {
  evaluateNextStep(
    run: AutonomousRun,
    context: {
      lastBuildStatus?: 'SUCCESS' | 'FAILED';
      lastQAStatus?: 'PASS' | 'FAIL' | 'WARNING';
      consecutiveFailures?: number;
      pendingApprovalsCount?: number;
      securityViolationDetected?: boolean;
      proposedAction?: string;
      commandBeingExecuted?: string;
    }
  ): DecisionEvaluation {
    const {
      lastBuildStatus,
      lastQAStatus,
      consecutiveFailures = 0,
      pendingApprovalsCount = 0,
      securityViolationDetected = false,
      proposedAction,
      commandBeingExecuted = '',
    } = context;

    // 1. Check Hard Limits
    if (run.currentIteration >= run.maxIterations) {
      return {
        action: 'STOP',
        reason: `Maximum iteration limit reached (${run.maxIterations} iterations).`,
        risk: 'LOW',
        requestedAction: 'Halt autonomous loop',
        recommendedDecision: 'Review completed iterations and review progress report before extending limits.',
        isStopCondition: true,
      };
    }

    if (run.elapsedSeconds >= run.maxRuntime * 60) {
      return {
        action: 'STOP',
        reason: `Maximum runtime limit reached (${run.maxRuntime} minutes elapsed).`,
        risk: 'LOW',
        requestedAction: 'Halt autonomous loop',
        recommendedDecision: 'Review resource consumption and resume with extended runtime if needed.',
        isStopCondition: true,
      };
    }

    if (run.budgetUsed >= run.budgetLimit) {
      return {
        action: 'STOP',
        reason: `Budget limit reached ($${run.budgetLimit.toFixed(2)} consumed).`,
        risk: 'MEDIUM',
        requestedAction: 'Halt autonomous loop',
        recommendedDecision: 'Increase budget ceiling in Safety Settings to authorize additional tokens/credits.',
        isStopCondition: true,
      };
    }

    // 2. Strict Security Stop Conditions
    if (securityViolationDetected) {
      return {
        action: 'WAIT_FOR_HUMAN',
        reason: 'Security configuration check triggered or protected resource targeted.',
        risk: 'CRITICAL',
        requestedAction: proposedAction || 'Access protected environment settings',
        recommendedDecision: 'Reject unauthorized action and inspect security logs.',
        isStopCondition: true,
      };
    }

    const dangerousCommandKeywords = ['rm -rf', 'drop table', 'chmod 777', 'git push --force', 'deploy --prod', 'curl | bash', '.env', 'secret'];
    const hasDangerousCommand = dangerousCommandKeywords.some((kw) =>
      commandBeingExecuted.toLowerCase().includes(kw)
    );
    if (hasDangerousCommand) {
      return {
        action: 'WAIT_FOR_HUMAN',
        reason: `Potentially dangerous command detected: "${commandBeingExecuted.substring(0, 50)}"`,
        risk: 'CRITICAL',
        requestedAction: `Execute command: ${commandBeingExecuted}`,
        recommendedDecision: 'Review command syntax and approve only in isolated sandbox with explicit intent.',
        isStopCondition: true,
      };
    }

    // 3. Repeated Failure Detection
    if (consecutiveFailures >= 3) {
      return {
        action: 'WAIT_FOR_HUMAN',
        reason: `Repeated failure detected (${consecutiveFailures} consecutive failed attempts on same issue).`,
        risk: 'HIGH',
        requestedAction: 'Continue automated retry loop',
        recommendedDecision: 'Halt automated retries to prevent thrashing. Review build/QA logs manually.',
        isStopCondition: true,
      };
    }

    // 4. Pending Human Approvals
    if (pendingApprovalsCount > 0 && run.mode !== 'AUTONOMOUS_SANDBOX') {
      return {
        action: 'WAIT_FOR_HUMAN',
        reason: `${pendingApprovalsCount} high-impact action(s) require human review.`,
        risk: 'HIGH',
        requestedAction: proposedAction || 'Execute high-impact change',
        recommendedDecision: 'Review affected systems in Human Approval Center before proceeding.',
        isStopCondition: true,
      };
    }

    // 5. Build & QA Loop decisions
    if (lastBuildStatus === 'FAILED') {
      if (run.autoFixEnabled && run.totalDebugCycles < 3) {
        return {
          action: 'DEBUG',
          reason: 'Build failed with syntax/type error. Safe auto-debug cycle initiated.',
          risk: 'LOW',
          requestedAction: 'Trigger AI Debug Agent and run targeted patch',
          recommendedDecision: 'Allow AI Debug Agent to fix known compilation error within sandbox.',
          isStopCondition: false,
        };
      } else {
        return {
          action: 'WAIT_FOR_HUMAN',
          reason: 'Build failed and auto-fix is either disabled or reached maximum debug attempts.',
          risk: 'MEDIUM',
          requestedAction: 'Manual code inspection and fix',
          recommendedDecision: 'Inspect compilation error logs in Builds tab.',
          isStopCondition: true,
        };
      }
    }

    if (lastQAStatus === 'FAIL') {
      if (run.autoFixEnabled && run.totalDebugCycles < 3) {
        return {
          action: 'DEBUG',
          reason: 'QA tests failed on functional check. Triggering AI Debug Agent.',
          risk: 'LOW',
          requestedAction: 'Diagnose regression or visual artifact',
          recommendedDecision: 'Allow Debug Agent to inspect failure trace and apply patch.',
          isStopCondition: false,
        };
      } else {
        return {
          action: 'WAIT_FOR_HUMAN',
          reason: 'QA failure requires human review.',
          risk: 'MEDIUM',
          requestedAction: 'Human triage of QA issues',
          recommendedDecision: 'Review QA test failure in QA & Debug tab.',
          isStopCondition: true,
        };
      }
    }

    // 6. Safe continuous development / improvement
    return {
      action: 'CONTINUE',
      reason: 'All checks passed. Safe to execute next scheduled milestone task.',
      risk: 'LOW',
      isStopCondition: false,
    };
  }
}

export const developmentDecisionEngine = new DevelopmentDecisionEngine();
