// interface IState {
//     show: boolean;
// }
// export class Confirm extends Component<BaseConfirmProps, IState> {
//     constructor(props: BaseConfirmProps) {
//         super();
//         this.state = {
//             show: props.show ?? false,
//         };
//     }
//     showModal(show: boolean) {
//         this.setState({
//             show,
//         });
//     }
//     handleClick() {
//         const { onClick } = this.props;
//         onClick?.();
//         this.showModal(false);
//     }
//     getGroup() {
//         const group = [
//             {
//                 label: <CustomLabel label="button.confirm" />,
//                 type: 'primary',
//                 onClick: () => this.handleClick(),
//             },
//             {
//                 label: <CustomLabel label="button.cancel" />,
//                 onClick: () => this.showModal(false),
//             },
//         ];
//         return group;
//     }
//     override UNSAFE_componentWillReceiveProps(props: BaseConfirmProps): void {
//         if (props.show !== this.props.show) {
//             this.setState({
//                 show: props.show,
//             });
//         }
//     }
//     render() {
//         const { title, content } = this.props;
//         const { show } = this.state;
//         return (
//             <div className={styles.confirmModal}>
//                 <Modal visible={show} isDrag={true} title={title} group={this.getGroup()}>
//                     {content}
//                 </Modal>
//             </div>
//         );
//     }
// }
import React, { useEffect, useState } from 'react';

import { Modal, ModalButtonGroup } from '../Modal';
import styles from './index.module.less';

interface BaseConfirmProps {
    title: string;
    content: string;
    onClick?: () => void;
    show?: boolean;
}

export function Confirm({ title, content, onClick, show = false }: BaseConfirmProps) {
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        setVisible(show);
    }, [show]);

    const handleClick = () => {
        onClick?.();
        setVisible(false);
    };

    const getGroup: ModalButtonGroup[] = [
        {
            label: 'button.confirm',
            type: 'primary',
            onClick: handleClick,
        },
        {
            type: 'default',
            label: 'button.cancel',
            onClick: () => setVisible(false),
        },
    ];

    return (
        <div className={styles.confirmModal}>
            <Modal visible={visible} isDrag={true} title={title} group={getGroup}>
                {content}
            </Modal>
        </div>
    );
}
