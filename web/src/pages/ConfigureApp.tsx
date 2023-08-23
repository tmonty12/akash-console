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
import { fetchSdlList } from '../recoil/api/sdl';
import { Icon } from '../components/Icons';
import { isSDLSpec } from '../components/SdlConfiguration/settings';
import { DirectoryConfig, aiModelDirectoryConfig } from '../AI-Model-Metadata/aiModel';
import { llama2SDL } from '../AI-Model-Metadata/deployments/llama2';

interface ConfigureAppProps {
  onNextButtonClick: any;
  folderName: string;
  templateId: string;
  progressVisible?: boolean;
  cardMessage?: string | undefined;
}

export const ConfigureApp: React.FC<ConfigureAppProps> = ({
  onNextButtonClick,
  folderName,
  templateId,
  progressVisible,
  cardMessage,
}) => {
  const [reviewSdl, showSdlReview] = useState(false);
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

  useEffect(() => {
    if (folderName == 'finetune') {
      setDirectoryConfig(aiModelDirectoryConfig);
    } else {
      setDirectoryConfig(directoryConfigQuery);
    }
  },[])

  useEffect(() => {
    // don't override the value if it's already set
    if (form.values?.sdl?.version) return;

    const template = directoryConfig?.topology.topologyList.find(
      (template: any) => template.title.toLowerCase() === templateId
    );

    if (template) {
      if (folderName == 'finetune') {
        // TO DO: change llama2SDL file to yaml file
        // TO DO: logic should be able to handle multiple deployments from AI Model dir
        const sdlYaml = yaml.load(llama2SDL);
        if (isSDLSpec(sdlYaml)) {
          form.setFieldValue('sdl', transformSdl(sdlYaml))
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
      actionItems={() => (
        <DeploymentAction>
          <Button variant="outlined" onClick={() => showSdlReview(true)}>
            <span className="mr-2">Review SDL</span> <Icon type="edit" />
          </Button>
          <div className="mr-3"></div>
          <Button
            variant="contained"
            onClick={() => {
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
