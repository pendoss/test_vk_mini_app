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
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import {User} from "@/entities/user";

export interface HomeProps extends NavIdProps {
  fetchedUser?: User;
  onOpenFitQuest?: () => void;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser, onOpenFitQuest }) => {
  const { avatar, city, firstName, lastName } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();

  return (
    <Panel id={id}>
      <PanelHeader>TrainSync</PanelHeader>
      {fetchedUser && (
        <Group header={<Header size="s">Добро пожаловать!</Header>}>
          <Cell before={avatar && <Avatar src={avatar} />} subtitle={city}>
            {`${firstName} ${lastName}`}
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
