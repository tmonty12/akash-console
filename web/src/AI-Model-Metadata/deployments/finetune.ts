export const finetuneSDL = `---
version: "2.0"

services:
  finetune:
    image: tmontfort/finetune:inference-v1.1
    env:
        - HUGGING_FACE_TOKEN=
        - ACCESS_KEY_ID=
        - SECRET_ACCESS_KEY=
        - ENDPOINT_URL=
    command:
        - "sh"
        - "-c"
    args:
        - 'python3 src/finetune_inference_flow.py --bucket_name  --hf_data_path  --model_name  --job_id '
    expose:
      - port: 8000
        as: 80
        to:
          - global: true

profiles:
  compute:
    finetune:
      resources:
        cpu:
          units: 4
        memory:
          size: 8Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: 3090
                - model: v100
                - model: a100
                - model: h100
                - model: a40
        storage:
          - size: 40Gi
  placement:
    akash:
      pricing:
        finetune: 
          denom: uakt
          amount: 100000

deployment:
  finetune:
    akash:
      profile: finetune
      count: 1
`;