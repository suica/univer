import { LocaleService, LocaleType, ThemeService } from '@univerjs/core';
import {
    ConfigProvider,
    Container,
    Content,
    defaultTheme,
    Footer,
    Header,
    ILocale,
    Layout,
    Sider,
    themeInstance,
} from '@univerjs/design';
import { useDependency, useInjector } from '@wendellhu/redi/react-bindings';
import React, { ComponentType, useEffect, useRef, useState } from 'react';

import { ComponentManager, ZIndexManager } from '../Common';
import { AppContext } from '../Common/AppContext';
import { IWorkbenchOptions } from '../controllers/ui/ui.controller';
import style from './app.module.less';
import { ContextMenu } from './components/ContextMenu';
import { DocBars } from './components/DocBars';

export interface IUniverAppProps extends IWorkbenchOptions {
    headerComponents?: Set<() => ComponentType>;
    contentComponents?: Set<() => ComponentType>;
    footerComponents?: Set<() => ComponentType>;
    sidebarComponents?: Set<() => ComponentType>;
    headerMenuComponents?: Set<() => ComponentType>;
    onRendered?: (container: HTMLElement) => void;
}

// eslint-disable-next-line max-lines-per-function
export function App(props: IUniverAppProps) {
    const injector = useInjector();
    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const zIndexManager = useDependency(ZIndexManager);
    const componentManager = useDependency(ComponentManager);

    const containerRef = useRef<HTMLDivElement>(null);

    const {
        headerComponents,
        headerMenuComponents,
        contentComponents,
        footerComponents,
        sidebarComponents,
        onRendered,
    } = props;

    useEffect(() => {
        if (!themeService.getCurrentTheme()) {
            themeService.setTheme(defaultTheme);
        }
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            onRendered?.(containerRef.current);
        }
    }, [onRendered]);

    const [locale, setLocale] = useState<LocaleType>(localeService.getLocale().getCurrentLocale());

    useEffect(() => {
        const subscriptions = [
            localeService.getLocale().locale$.subscribe((locale) => {
                locale && setLocale(locale);
            }),
            themeService.currentTheme$.subscribe((theme) => {
                themeInstance.setTheme(theme);
            }),
        ];

        return () => {
            // batch unsubscribe
            subscriptions.forEach((subscription) => subscription.unsubscribe());
        };
    }, []);

    return (
        <AppContext.Provider value={{ injector, localeService, themeService, locale, componentManager, zIndexManager }}>
            <ConfigProvider locale={localeService.getLocales() as unknown as ILocale}>
                <Container className={style.layoutContainer}>
                    <Layout>
                        {/* outer sidebar */}
                        <Sider style={{ display: props.outerLeft ? 'block' : 'none' }}></Sider>
                        <Layout className={style.mainContent} style={{ position: 'relative' }}>
                            {/* header */}
                            <Header style={{ display: props.header ? 'block' : 'none' }}>
                                {props.toolbar && <DocBars />}
                                {headerComponents &&
                                    Array.from(headerComponents.values()).map((component, index) =>
                                        React.createElement(component(), { key: `${index}` })
                                    )}
                                <div className={style.headerMenu}>
                                    {headerMenuComponents &&
                                        Array.from(headerMenuComponents.values()).map((component, index) =>
                                            React.createElement(component(), { key: `${index}` })
                                        )}
                                </div>
                            </Header>
                            {/* content */}
                            <Layout>
                                <Sider
                                    style={{ display: props.innerLeft ? 'block' : 'none' }}
                                    className={style.contentInnerLeftContainer}
                                >
                                    {/* inner left */}
                                    {sidebarComponents &&
                                        Array.from(sidebarComponents.values()).map((component, index) =>
                                            React.createElement(component(), { key: `${index}` })
                                        )}
                                </Sider>
                                <Content className={style.contentContainerHorizontal}>
                                    <ContextMenu>
                                        <Container className={style.contentInnerRightContainer} ref={containerRef}>
                                            {contentComponents &&
                                                Array.from(contentComponents.values()).map((component, index) =>
                                                    React.createElement(component(), { key: `${index}` })
                                                )}
                                        </Container>
                                    </ContextMenu>
                                </Content>
                            </Layout>
                            {/* footer */}
                            <Footer style={{ display: props.footer ? 'block' : 'none' }}>
                                {footerComponents &&
                                    Array.from(footerComponents.values()).map((component, index) =>
                                        React.createElement(component(), { key: `${index}` })
                                    )}
                            </Footer>
                        </Layout>
                    </Layout>
                </Container>
            </ConfigProvider>
        </AppContext.Provider>
    );
}
