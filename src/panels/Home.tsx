import { FC } from 'react';
import {
  Panel,
  PanelHeader,
  Header,
  Button,
  Group,
  Cell,
  Div,
  Avatar,
  NavIdProps,
} from '@vkontakte/vkui';
import { UserInfo } from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
  onOpenFitQuest?: () => void;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser, onOpenFitQuest }) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();

  return (
    <Panel id={id}>
      <PanelHeader>TrainSync</PanelHeader>
      {fetchedUser && (
        <Group header={<Header size="s">Добро пожаловать!</Header>}>
          <Cell before={photo_200 && <Avatar src={photo_200} />} subtitle={city?.title}>
            {`${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}

      <Group header={<Header size="s">Фитнес-приложение</Header>}>
        <Div>
          <Button 
            stretched 
            size="l" 
            mode="primary" 
            onClick={onOpenFitQuest}
            style={{ marginBottom: 12 }}
          >
            🏃‍♂️ Открыть FitQuest
          </Button>
          <Button 
            stretched 
            size="l" 
            mode="secondary" 
            onClick={() => routeNavigator.push('persik')}
          >
            Покажите Персика, пожалуйста!
          </Button>
        </Div>
      </Group>
    </Panel>
  );
};
