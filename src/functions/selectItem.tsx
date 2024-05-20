function selectItem(e: React.MouseEvent, setDropItem: (element: HTMLElement | undefined) => void, pc: boolean){
    const targetElement = e.currentTarget;
    const parentElement = targetElement.parentElement;
    
    if (parentElement && !pc) {
      setDropItem(e.currentTarget as HTMLElement)
      const previouslySelected = document.getElementById("selected");
      if (previouslySelected) {
        previouslySelected.removeAttribute("id");
      }
      parentElement.id = "selected";
    }
  }

export {selectItem}