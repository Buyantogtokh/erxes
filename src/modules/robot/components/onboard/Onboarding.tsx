import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import RTG from 'react-transition-group';
import FeatureDetail from '../../containers/FeatureDetail';
import { IFeature } from '../../types';
import { getCurrentUserName } from '../../utils';
import ActionItem from '../ActionItem';
import { Content, Greeting, NavButton, SeeAll } from '../styles';
import OnboardOpener from './OnboardOpener';

type Props = {
  availableFeatures: IFeature[];
  onboardStep?: string;
  changeStep: (step: string) => void;
  changeRoute: (route: string) => void;
  forceComplete: () => void;
  currentUser: IUser;
  show: boolean;
};

type State = {
  selectedFeature?: IFeature;
  featureLimit: number;
};

class Onboarding extends React.Component<Props, State> {
  private limit = 9;

  constructor(props) {
    super(props);

    this.state = { selectedFeature: undefined, featureLimit: this.limit };
  }

  renderFeature(feature: IFeature) {
    const { changeStep } = this.props;
    const { text, isComplete, description, icon, color } = feature;

    const onClick = () => {
      this.setState({ selectedFeature: feature }, () => {
        changeStep('featureDetail');
      });
    };

    return (
      <ActionItem
        title={text}
        description={description}
        icon={icon}
        color={color}
        key={feature.name}
        vertical={true}
        onClick={onClick}
        isComplete={isComplete}
      />
    );
  }

  renderContent() {
    const { selectedFeature } = this.state;
    const {
      availableFeatures,
      onboardStep,
      changeStep,
      currentUser,
      forceComplete
    } = this.props;

    const commonProps = {
      forceComplete,
      currentUser: getCurrentUserName(currentUser)
    };

    if (onboardStep === 'initial' || onboardStep === 'inComplete') {
      const onClick = () => {
        changeStep('featureList');
        this.props.changeRoute('onboardStart');
      };

      return (
        <OnboardOpener
          {...commonProps}
          buttonText={onboardStep === 'initial' ? 'Start' : 'Resume'}
          onClick={onClick}
        />
      );
    }

    if (onboardStep === 'featureDetail') {
      const onBack = () => {
        this.setState({ selectedFeature: undefined }, () => {
          changeStep('featureList');
        });
      };

      return (
        <>
          <NavButton onClick={onBack}>
            <Icon icon="arrow-left" size={24} />
          </NavButton>
          {selectedFeature && <FeatureDetail feature={selectedFeature} />}
        </>
      );
    }

    if (onboardStep === 'featureList') {
      return (
        <>
          <Greeting>
            {__('Hello')}!{' '}
            <b>
              {getCurrentUserName(currentUser)}
              <span role="img" aria-label="Wave">
                👋
              </span>
            </b>
            <br /> {__('Which feature do you want to set up')}
          </Greeting>
          {availableFeatures
            .filter((feature, index) => index < this.state.featureLimit)
            .map(availabeFeature => this.renderFeature(availabeFeature))}

          <SeeAll onClick={this.toggleFeatures}>
            {this.isCollapsed()
              ? __('Explore more features')
              : __('Hide some features')}
            <Icon icon="angle-double-right" />
          </SeeAll>
        </>
      );
    }

    return null;
  }

  onHide = () => {
    this.props.changeRoute('');
  };

  isCollapsed = () => {
    return this.state.featureLimit === this.limit;
  };

  toggleFeatures = () => {
    const all = this.props.availableFeatures.length;

    this.setState({ featureLimit: this.isCollapsed() ? all : this.limit });
  };

  render() {
    const { show, onboardStep } = this.props;

    return (
      <RTG.CSSTransition
        in={onboardStep && show}
        appear={true}
        timeout={600}
        classNames="slide-in-small"
        unmountOnExit={true}
      >
        <Content>
          <NavButton onClick={this.onHide} right={true}>
            <Icon icon="times" size={15} />
          </NavButton>
          {this.renderContent()}
        </Content>
      </RTG.CSSTransition>
    );
  }
}

export default Onboarding;