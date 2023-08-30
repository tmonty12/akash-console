export const llama2SDL = `---
version: "2.0"

services:
  llama2agora:
    image: ishandhanani/llama2:latest
    env:
        - HUGGING_FACE_TOKEN=
    command:
        - "sh"
        - "-c"
    args:
        - 'python3 agora_python_bot.py --s3_bucket= --data_set= --model=llama2'
    expose:
      - port: 8000
        as: 80
        to:
          - global: true

profiles:
  compute:
    llama2agora:
      resources:
        cpu:
          units: 8
        memory:
          size: 50Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
        storage:
          - size: 40Gi
  placement:
    akash:
      pricing:
        llama2agora: 
          denom: uakt
          amount: 100000

deployment:
  llama2agora:
    akash:
      profile: llama2agora
      count: 1
`