import { cn } from "@/lib/utils";
import { motion, MotionProps, Variants } from "framer-motion";
import { ElementType } from "react";

type AnimationType = "text" | "word" | "character" | "line";
type AnimationVariant =
    | "fadeIn"
    | "blurIn"
    | "blurInUp"
    | "blurInDown"
    | "slideUp"
    | "slideDown"
    | "scaleUp";

interface TextAnimateProps extends MotionProps {
    /**
     * The text content to animate
     */
    children: string;
    /**
     * The class name to apply to the container
     */
    className?: string;
    /**
     * The element type to render
     * @default "p"
     */
    as?: ElementType;
    /**
     * How to split the text
     * @default "character"
     */
    by?: AnimationType;
    /**
     * The animation variant to use
     * @default "fadeIn"
     */
    animation?: AnimationVariant;
    /**
     * The duration of the animation in seconds
     * @default 0.3
     */
    duration?: number;
    /**
     * The delay between each element in seconds
     * @default 0.05
     */
    delay?: number;
    /**
     * Whether to trigger the animation only once
     * @default false
     */
    once?: boolean;
}

const animations: Record<AnimationVariant, { container: Variants, child: Variants }> = {
    fadeIn: {
        container: {
            hidden: { opacity: 0 },
            show: (i = 1) => ({
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: i * 0.05 },
            }),
        },
        child: {
            hidden: { opacity: 0 },
            show: {
                opacity: 1,
                transition: {
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                },
            },
            exit: { opacity: 0 },
        },
    },
    blurIn: {
        container: {
            hidden: { opacity: 0 },
            show: (i = 1) => ({
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: i * 0.05 },
            }),
        },
        child: {
            hidden: { opacity: 0, filter: "blur(10px)" },
            show: {
                opacity: 1,
                filter: "blur(0px)",
                transition: {
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                },
            },
            exit: { opacity: 0, filter: "blur(10px)" },
        },
    },
    blurInUp: {
        container: {
            hidden: { opacity: 0 },
            show: (i = 1) => ({
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: i * 0.05 },
            }),
        },
        child: {
            hidden: { opacity: 0, y: 15, filter: "blur(10px)" },
            show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                    y: { type: "spring", damping: 20, stiffness: 100 },
                    filter: { type: "spring", damping: 20, stiffness: 100 },
                    opacity: { duration: 0.2 },
                },
            },
            exit: { opacity: 0, y: -15, filter: "blur(10px)" },
        },
    },
    blurInDown: {
        container: {
            hidden: { opacity: 0 },
            show: (i = 1) => ({
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: i * 0.05 },
            }),
        },
        child: {
            hidden: { opacity: 0, y: -15, filter: "blur(10px)" },
            show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                },
            },
            exit: { opacity: 0, y: 15, filter: "blur(10px)" },
        },
    },
    slideUp: {
        container: {
            hidden: { opacity: 0 },
            show: (i = 1) => ({
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: i * 0.05 },
            }),
        },
        child: {
            hidden: { opacity: 0, y: 20 },
            show: {
                opacity: 1,
                y: 0,
                transition: {
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                },
            },
            exit: { opacity: 0, y: -20 },
        },
    },
    slideDown: {
        container: {
            hidden: { opacity: 0 },
            show: (i = 1) => ({
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: i * 0.05 },
            }),
        },
        child: {
            hidden: { opacity: 0, y: -20 },
            show: {
                opacity: 1,
                y: 0,
                transition: {
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                },
            },
            exit: { opacity: 0, y: 20 },
        },
    },
    scaleUp: {
        container: {
            hidden: { opacity: 0 },
            show: (i = 1) => ({
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: i * 0.05 },
            }),
        },
        child: {
            hidden: { opacity: 0, scale: 0.5 },
            show: {
                opacity: 1,
                scale: 1,
                transition: {
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                },
            },
            exit: { opacity: 0, scale: 0.5 },
        },
    },
};

export function TextAnimate({
    children,
    className,
    as: Component = "p",
    by = "character",
    animation = "fadeIn",
    duration = 0.3,
    delay = 0.05,
    once = false,
    ...props
}: TextAnimateProps) {
    const selectedAnimation = animations[animation];

    const getStaggerDelay = () => {
        switch (by) {
            case "line":
                return delay * 3;
            case "word":
                return delay * 2;
            default:
                return delay;
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: (i = 1) => ({
            opacity: 1,
            transition: {
                staggerChildren: getStaggerDelay(),
                delayChildren: i * getStaggerDelay(),
            },
        }),
        exit: {
            opacity: 0,
            transition: { staggerChildren: 0.05, staggerDirection: -1 },
        },
    };

    const childVariants = selectedAnimation.child;

    let segments: string[] = [];
    switch (by) {
        case "line":
            segments = children.split("\n");
            break;
        case "word":
            segments = children.split(" ");
            break;
        case "character":
        default:
            segments = children.split("");
            break;
    }

    const MotionComponent = motion(Component as any);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn("inline-block whitespace-pre-wrap", className)}
            {...props}
        >
            {segments.map((segment, i) => (
                <MotionComponent
                    custom={i}
                    variants={childVariants}
                    key={i}
                    className={cn("inline-block", by === "line" ? "block" : "inline-block", by === "word" ? "mr-[0.25em]" : "")}
                >
                    {segment}
                </MotionComponent>
            ))}
        </motion.div>
    );
}
