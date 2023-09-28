import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { useFormikContext } from 'formik';
import yaml from 'js-yaml';
import axios from 'axios';
import { SdlConfiguration } from '../components/SdlConfiguration/SdlConfiguration';
import { transformSdl } from '../_helpers/helpers';
import { SdlConfigurationType } from '../components/SdlConfiguration/settings';
import { useQuery } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import { fetchSdlList } from '../recoil/api/sdl';
import { Icon } from '../components/Icons';
import { isSDLSpec } from '../components/SdlConfiguration/settings';
import { DirectoryConfig, aiModelDirectoryConfig } from '../AI-Model-Metadata/aiModel';
import { finetuneSDL } from '../AI-Model-Metadata/deployments/finetune';

interface ConfigureAppProps {
  onNextButtonClick: any;
  folderName: string;
  templateId: string;
  progressVisible?: boolean;
  cardMessage?: string | undefined;
}

type ScriptArgs = {
  [key: string] : string;
}

export const ConfigureApp: React.FC<ConfigureAppProps> = ({
  onNextButtonClick,
  folderName,
  templateId,
  progressVisible,
  cardMessage,
}) => {
  const [reviewSdl, showSdlReview] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [jobId, setJobId ] = React.useState<string>('');
  const [finetuneJobState, setFinetuneJobState] = useState<ScriptArgs>({
    'job_id': uuidv4()
  });
  // prevent function being recreated on state change
  const closeReviewModal = useCallback(() => showSdlReview(false), []);
  const form = useFormikContext() as any;

  const { data: directoryConfigQuery } = useQuery(['sdlList', { folderName }], fetchSdlList, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const [directoryConfig, setDirectoryConfig] = useState<DirectoryConfig>({ topology: { selected: '', topologyList: [] }, title: {
    description: '',
    logo: '',
    name: '',
  }});

  const handleSave = (sdl: any) => {
    // Update the form values with the saved SDL
    form.setFieldValue('sdl', sdl);
  };

  const getArg = (s3Bucket: string, dataSet: string, model: string, submission=false) =>  {
    // 1) User selects model or data set or enters bucket name - should be reflected in the arg
    // 2) User adds their own option - should be updated in internal state for when user performs 1)

    let arg = '';
    if (submission ) {
      arg = 'python3 src/finetune_inference_flow.py';
      if (s3Bucket != '') arg += ` --bucket_name ${s3Bucket}`;
      if (dataSet != '') arg += ` --hf_data_path ${dataSet}`;
      if (model != '') arg += ` --model_name ${model}`;
    } else {
      arg = `python3 src/finetune_inference_flow.py --bucket_name ${s3Bucket} --hf_data_path ${dataSet} --model_name ${model}`;
    }
    
    for (const option in finetuneJobState) {
      arg += ` --${option} ${finetuneJobState[option]}`;
    }

    return arg;
  };

  const getRegexMatch = (str: string, regex: RegExp) => {
    const match = str.match(regex);
    return match ? match[1] : '';
  };
  const getS3BucketVal = (arg: string) => {
      return getRegexMatch(arg, /--bucket_name ([^ ]+)/);
  };
  const getDataSetVal = (arg: string) => {
      return getRegexMatch(arg, /--hf_data_path ([^ ]+)/);
  };
  const getModelVal= (arg: string) => {
      return getRegexMatch(arg, /--model_name ([^ ]+)/);
  };

  useEffect(() => {
    // Strictly for the agora finetune pipeline.
    // Responsible for capturing extra script arguments outside of the default ones
    // so that updating the arg with getArg includes the additional args
    if (folderName == 'agora' && form && form.values.sdl && form.values.sdl.services[serviceName]) {
      const pattern = /--(\w+)\s([^\s]+)/g;
      
      const args: ScriptArgs = {};
      const defaultOptions  = ['model_name', 'hf_data_path', 'bucket_name'];
      let match;
      while ((match = pattern.exec(form.values.sdl.services[serviceName].args[0]))!= null) {
        if (!defaultOptions.includes(match[1])) {
          args[match[1]] = match[2];
        }
      }
      // If user removes the job_id, we want to make sure we add the job_id back
      if (!('job_id' in args)) {
        args['job_id'] = finetuneJobState.job_id;
      }
      setFinetuneJobState(args);
    }
  }, [form]);

  useEffect(() => {
    if (folderName == 'agora') {
      setDirectoryConfig(aiModelDirectoryConfig);
    } else {
      setDirectoryConfig(directoryConfigQuery);
    }
  },[]);

  useEffect(() => {
    // don't override the value if it's already set
    if (form.values?.sdl?.version) return;

    const template = directoryConfig?.topology.topologyList.find(
      (template: any) => template.title.toLowerCase() === templateId
    );

    if (template) {
      if (folderName == 'agora') {
        // TO DO: change llama2SDL file to yaml file
        // TO DO: logic should be able to handle multiple deployments from AI Model dir
        const sdlYaml = yaml.load(finetuneSDL);
        if (isSDLSpec(sdlYaml)) {
          form.setFieldValue('sdl', transformSdl(sdlYaml));
        }
      } else {
        axios
          .get(template.url)
          .then((resp) => yaml.load(resp.data))
          .then((sdl) => {
            if (isSDLSpec(sdl)) {
              form.setFieldValue('sdl', transformSdl(sdl));
            } else {
              console.error('Template is not a valid SDL spec');
            }
          });
      }
    }
  }, [directoryConfig, templateId, form]);

  // prevent exception on initial load
  if (!form.values['sdl']) {
    return <></>;
  }

  return (
    <SdlConfiguration
      sdl={form.values['sdl']}
      reviewSdl={reviewSdl}
      closeReviewModal={closeReviewModal}
      configurationType={SdlConfigurationType.Create}
      progressVisible={progressVisible}
      cardMessage={cardMessage}
      onSave={handleSave} // Add the onSave prop
      folderName={folderName}
      setServiceName={setServiceName}
      getArg={getArg}
      getModelVal={getModelVal}
      getS3BucketVal={getS3BucketVal}
      getDataSetVal={getDataSetVal}
      actionItems={() => (
        <DeploymentAction>
          <Button variant="outlined" onClick={() => showSdlReview(true)}>
            <span className="mr-2">Review SDL</span> <Icon type="edit" />
          </Button>
          <div className="mr-3"></div>
          <Button
            variant="contained"
            onClick={() => {
              
              // 
              let arg = form.values.sdl.services[serviceName].args[0];
              arg = getArg(getS3BucketVal(arg), getDataSetVal(arg), getModelVal(arg), true);
              console.log(arg);
              form.setFieldValue(`sdl.services.${serviceName}.args.0`, arg);

              // this needs to be done  to ensure the DeploymentStepper params
              // are correct so that the active index (e.g. activeStep) is correct
              return onNextButtonClick('preflight-check');
            }}
          >
            Create Deployment
          </Button>
        </DeploymentAction>
      )}
    />
  );
};

const DeploymentAction = styled.div`
  display: flex;
  justify-content: flex-end;
`;
