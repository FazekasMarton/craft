import clickSound from "../assets/audio/click.mp3"

const clickAudio = new Audio(clickSound)
clickAudio.preload = "auto"

function selectItem(e: React.MouseEvent, setDropItem: (element: HTMLElement | undefined) => void, pc: boolean) {
    const targetElement = e.currentTarget;
    const parentElement = targetElement.parentElement;

    if (parentElement && !pc) {
        clickAudio.play()
        setTimeout(() => {
            setDropItem(e.currentTarget as HTMLElement)
            const previouslySelected = document.getElementById("selected");
            if (previouslySelected) {
                previouslySelected.removeAttribute("id");
            }
            parentElement.id = "selected";
        }, clickAudio.duration * 1000);
    }
}

export { selectItem }