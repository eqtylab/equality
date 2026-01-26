import {
  Button,
  DialogDescription,
  Dialog,
  DialogContainer,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Card,
  CardContent,
  ELEVATION,
} from "@eqtylab/equality";
import { useState } from "react";

export const DialogDemo = ({
  size = "md",
  showMaxHeight = false,
}: {
  size?: "sm" | "md" | "lg";
  showMaxHeight?: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button size="sm" onClick={() => setIsModalOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContainer size={size}>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Subtitle</DialogDescription>
          </DialogHeader>
          <DialogContent>
            {showMaxHeight ? (
              <>
                This is example content to demonstrate the max height behavior
                of the dialog component. When the content exceeds 75vh, the
                dialog will show a scrollbar.
                <br />
                <br />
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
                <br />
                <br />
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo.
                <br />
                <br />
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt.
                <br />
                <br />
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
                consectetur, adipisci velit, sed quia non numquam eius modi
                tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem.
                <br />
                <br />
                Ut enim ad minima veniam, quis nostrum exercitationem ullam
                corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
                consequatur? Quis autem vel eum iure reprehenderit qui in ea
                voluptate velit esse quam nihil molestiae consequatur.
                <br />
                <br />
                At vero eos et accusamus et iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atque corrupti quos
                dolores et quas molestias excepturi sint occaecati cupiditate
                non provident.
                <br />
                <br />
                Similique sunt in culpa qui officia deserunt mollitia animi, id
                est laborum et dolorum fuga. Et harum quidem rerum facilis est
                et expedita distinctio.
                <br />
                <br />
                Nam libero tempore, cum soluta nobis est eligendi optio cumque
                nihil impedit quo minus id quod maxime placeat facere possimus,
                omnis voluptas assumenda est, omnis dolor repellendus.
                <br />
                <br />
                Temporibus autem quibusdam et aut officiis debitis aut rerum
                necessitatibus saepe eveniet ut et voluptates repudiandae sint
                et molestiae non recusandae.
                <br />
                <br />
                Itaque earum rerum hic tenetur a sapiente delectus, ut aut
                reiciendis voluptatibus maiores alias consequatur aut
                perferendis doloribus asperiores repellat.
              </>
            ) : (
              <>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </>
            )}
          </DialogContent>
          <DialogFooter>
            <Button
              size="sm"
              variant="tertiary"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContainer>
      </Dialog>
    </div>
  );
};

export const DialogWithTableDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button size="sm" onClick={() => setIsModalOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContainer>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <DialogContent>
            <Card elevation={ELEVATION.FLOATING}>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Card</h4>
                  <p className="text-text-secondary text-sm">
                    This card has an elevation of Floating.
                  </p>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
          <DialogFooter>
            <Button
              size="sm"
              variant="tertiary"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContainer>
      </Dialog>
    </div>
  );
};
