import clickSound from "../assets/audio/click.mp3"

function selectItem(e: React.MouseEvent, setDropItem: (element: HTMLImageElement | undefined) => void, pc: boolean) {
    const targetElement = e.currentTarget;
    const parentElement = targetElement.parentElement;

    if (parentElement && !pc) {
        const clickAudio = new Audio(clickSound)
        clickAudio.preload = "auto"
        clickAudio.play()
        setDropItem(e.currentTarget as HTMLImageElement)
        setTimeout(() => {
            const previouslySelected = document.getElementById("selected");
            if (previouslySelected) {
                previouslySelected.removeAttribute("id");
            }
            parentElement.id = "selected";
        }, clickAudio.duration * 250);
    }
}

export { selectItem }