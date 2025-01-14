import { Template } from '../components/SdlConfiguration/settings';

export interface Tile {
    buttonState?: boolean;
    buttonText?: string;
    description: string;
    logo: string;
    logoFileNameWithoutExt: string;
    name: string;
    targetDeployTemplate?: string;
    title?: string;  
}
  
export interface TemplateListConfig {
    importSdl?: boolean;
    introText?: string;
    maxHorizontalTiles?: number;
    tiles: Tile[]
    version?: string;
}

export interface DirectoryConfig {
    bannerColor?: string;
    title: DirectoryConfigTitle;
    topology: Topologies;
    promotion?: Promotion;
    headline?: Template;
    video?: string; 
}

export interface Promotion {
    title: string;
    url: string;
    description: string;
    image: string;
}
export interface DirectoryConfigTitle {
    description: string;
    logo: string;
    name: string;
}

export interface Topologies {
    selected: string;
    topologyList: Template[];
    version?: string;
    social?: TopologySocial;
}

export interface TopologySocial {
    twitter: string;
}

export const aiModelTemplateListConfig: TemplateListConfig = {
    importSdl: true,
    introText: '',
    maxHorizontalTiles: 4,
    tiles: [
      {
        buttonState: true,
        buttonText: 'Deploy Now',
        description: 'An LLMops pipeline for finetuning and deploying LLM models',
        logo: '',
        logoFileNameWithoutExt: 'finetune',
        name: 'Agora',
        targetDeployTemplate: '',
        title: 'Agora'
      }
    ],
    version: '0.0.1'
};

export const aiModelDirectoryConfig: DirectoryConfig = {
    bannerColor: '',
    title: {
        description: aiModelTemplateListConfig.tiles[0].description,
        logo: aiModelTemplateListConfig.tiles[0].logo,
        name: aiModelTemplateListConfig.tiles[0].name,
    },
    topology: {
        selected: '',
        topologyList: [
                {
                    description: 'Fine tune an open source LLM with your own dataset and automatically deploy to inference',
                    title: 'Finetune',
                    url: ''
                }
        ],
        version: '0.0.1'
    },
};