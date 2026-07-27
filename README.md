# Noted Markdown App

This project is in progress.

## Dev Setup

To work on this repo, follow the steps below.

1. Clone the repo to your local environment

```bash
git clone git@github.com:bjf5201/noted.git
```

2. Open with VSCode and select "Open in Container" when prompted. If using another editor, skip this step.

3. Begin editing!

### SSH Agent Forwarding in WSL2

If you are working with VSCode on WSL2 as your dev environment, you will need to ensure that your SSH Agent is forwarded into the devcontainer in order to communicate with GitHub properly.

To ensure your ssh-agent is running, add the following code to your `.bash_profile` or `.profile` config:

```bash
# Create ssh-agent at startup
if [ -z "$SSH_AUTH_SOCK" ]; then
    # Check for a currently running instance of the agent
    RUNNING_AGENT="`ps -ax | grep 'ssh-agent -s' | grep -v grep | wc -l | tr -d '[:space:]'`"
    if [ "$RUNNING_AGENT" = "0" ]; then
        # Launch a new instance of the agent
        ssh-agent -s &> $HOME/.ssh/ssh-agent
    fi
    eval `cat $HOME/.ssh/ssh-agent`
fi

# Add key to this ssh-agent session.
# Running `ssh-add` without arguments automatically adds:
#   - ~/.ssh/id_rsa
#   - ~/.ssh/id_dsa
#   - ~/.ssh/id_ecdsa
#   - ~/.ssh/id_ecdsa_sk
#   - ~/.ssh/id_ed25519
#   - ~/.ssh/id_ed25519_sk
ssh-add

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include ~/.bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi
```

To ensure that VSCode has been forwarded the SSH agent, run the following _inside_ your devcontainer:

```bash
echo "$SSH_AUTH_SOCK"
```

If it is blank, the SSH agent has not be forwarded. Otherwise, proceed to the next check:

```bash
ssh -T git@github.com
```

You should recieve an output similar to: `Hi {username}! You've successfully authenticated, but GitHub does not provide shell access.`
